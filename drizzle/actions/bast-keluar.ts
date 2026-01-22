"use server";

import { db } from "@/lib/db";
import {
  bastKeluar,
  bastKeluarDetail,
  sppb,
  barang,
  mutasiBarang,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateBastKeluarNumber } from "./generate-number";
import {
  bastKeluarFormSchema,
  bastKeluarItemSchema,
} from "@/lib/zod/bast-keluar-schema";

// Helper to check authentication
async function checkAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// Helper to format date
function formatDateForDB(date: string | Date): string {
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to calculate financial totals
function calculateFinancials(items: z.infer<typeof bastKeluarItemSchema>[]) {
  let subtotal = 0;
  let totalPpn = 0;

  const itemsWithTotals = items.map((item) => {
    const itemSubtotal = item.qtySerahTerima * item.hargaSatuan;
    const nilaiPpn = (itemSubtotal * item.persentasePpn) / 100;
    const totalHarga = itemSubtotal + nilaiPpn;

    subtotal += itemSubtotal;
    totalPpn += nilaiPpn;

    return {
      ...item,
      nilaiPpn,
      totalHarga,
    };
  });

  const grandTotal = subtotal + totalPpn;

  return {
    itemsWithTotals,
    subtotal,
    totalPpn,
    grandTotal,
  };
}

export async function createBastKeluarFromSPPB(
  prevState: any,
  data: z.infer<typeof bastKeluarFormSchema>,
) {
  try {
    const validated = bastKeluarFormSchema.parse(data);

    // Verify SPPB exists and is completed
    const sppbData = await db.query.sppb.findFirst({
      where: eq(sppb.id, validated.sppbId),
    });

    if (!sppbData) {
      return { success: false, message: "SPPB tidak ditemukan" };
    }

    const tglBast = formatDateForDB(validated.tanggalBast);

    // Calculate financials
    const { itemsWithTotals, subtotal, totalPpn, grandTotal } =
      calculateFinancials(validated.items);

    await db.transaction(async (tx) => {
      // Generate BAST number
      const nomorBast = await generateBastKeluarNumber();

      // Create BAST Keluar Header
      const [newBast] = await tx
        .insert(bastKeluar)
        .values({
          nomorBast,
          tanggalBast: tglBast,
          sppbId: validated.sppbId,
          pihakPertamaId: validated.pihakPertamaId,
          pihakKeduaId: validated.pihakKeduaId,
          subtotal: subtotal.toString(),
          totalPpn: totalPpn.toString(),
          grandTotal: grandTotal.toString(),
          keterangan: validated.keterangan,
        })
        .returning();

      // Create BAST Keluar Details
      for (const item of itemsWithTotals) {
        await tx.insert(bastKeluarDetail).values({
          bastKeluarId: newBast.id,
          barangId: item.barangId,
          qtySerahTerima: item.qtySerahTerima,
          hargaSatuan: item.hargaSatuan.toString(),
          persentasePpn: item.persentasePpn,
          nilaiPpn: item.nilaiPpn.toString(),
          totalHarga: item.totalHarga.toString(),
          keterangan: item.keterangan,
        });

        const [currentBarang] = await tx
          .select({ stok: barang.stok, nama: barang.nama })
          .from(barang)
          .where(eq(barang.id, item.barangId));

        const newStock = (currentBarang?.stok || 0) - item.qtySerahTerima;

        if (newStock < 0) {
          throw new Error(
            `Stok barang "${currentBarang?.nama || "Unknown"}" tidak cukup. Stok saat ini (${currentBarang?.stok || 0}), dibutuhkan ${item.qtySerahTerima}.`,
          );
        }

        await tx
          .update(barang)
          .set({ stok: newStock })
          .where(eq(barang.id, item.barangId));

        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          tanggal: new Date(),
          jenisMutasi: "KELUAR",
          qtyMasuk: 0,
          qtyKeluar: item.qtySerahTerima,
          stokAkhir: newStock,
          referensiId: nomorBast,
          sumberTransaksi: "BAST_KELUAR",
          keterangan: `Pengeluaran Barang via BAST ${nomorBast}`,
        });
      }

      // Update SPPB status to SELESAI
      await tx
        .update(sppb)
        .set({
          status: "SELESAI",
          updatedAt: new Date(),
        })
        .where(eq(sppb.id, validated.sppbId));
    });

    revalidatePath("/dashboard/bast-keluar");
    revalidatePath(`/dashboard/sppb/${validated.sppbId}`);
    revalidatePath("/dashboard/barang");
    revalidatePath("/dashboard/mutasi");
    return { success: true, message: "BAST Keluar berhasil dibuat" };
  } catch (error: any) {
    console.error("Error creating BAST Keluar:", error);
    return {
      success: false,
      message: error.message || "Gagal membuat BAST Keluar",
    };
  }
}

export async function updateBastKeluar(
  id: number,
  prevState: any,
  data: z.infer<typeof bastKeluarFormSchema>,
) {
  try {
    const validated = bastKeluarFormSchema.parse(data);

    const existingBast = await db.query.bastKeluar.findFirst({
      where: eq(bastKeluar.id, id),
    });

    if (!existingBast) {
      return { success: false, message: "BAST Keluar tidak ditemukan" };
    }

    const tglBast = formatDateForDB(validated.tanggalBast);

    // Calculate financials
    const { itemsWithTotals, subtotal, totalPpn, grandTotal } =
      calculateFinancials(validated.items);

    await db.transaction(async (tx) => {
      // Update BAST Keluar Header
      await tx
        .update(bastKeluar)
        .set({
          tanggalBast: tglBast,
          pihakPertamaId: validated.pihakPertamaId,
          pihakKeduaId: validated.pihakKeduaId,
          subtotal: subtotal.toString(),
          totalPpn: totalPpn.toString(),
          grandTotal: grandTotal.toString(),
          keterangan: validated.keterangan,
        })
        .where(eq(bastKeluar.id, id));

      // Delete existing details
      await tx
        .delete(bastKeluarDetail)
        .where(eq(bastKeluarDetail.bastKeluarId, id));

      // Create new details
      for (const item of itemsWithTotals) {
        await tx.insert(bastKeluarDetail).values({
          bastKeluarId: id,
          barangId: item.barangId,
          qtySerahTerima: item.qtySerahTerima,
          hargaSatuan: item.hargaSatuan.toString(),
          persentasePpn: item.persentasePpn,
          nilaiPpn: item.nilaiPpn.toString(),
          totalHarga: item.totalHarga.toString(),
          keterangan: item.keterangan,
        });
      }
    });

    revalidatePath("/dashboard/bast-keluar");
    revalidatePath(`/dashboard/bast-keluar/${id}`);
    return { success: true, message: "BAST Keluar berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating BAST Keluar:", error);
    return {
      success: false,
      message: error.message || "Gagal memperbarui BAST Keluar",
    };
  }
}

export async function deleteBastKeluar(id: number) {
  try {
    const session = await checkAuth();

    const existingBast = await db.query.bastKeluar.findFirst({
      where: eq(bastKeluar.id, id),
    });

    if (!existingBast) {
      return { success: false, message: "BAST Keluar tidak ditemukan" };
    }

    await db.transaction(async (tx) => {
      await tx.delete(bastKeluar).where(eq(bastKeluar.id, id));

      // Revert SPPB status to MENUNGGU_BAST if it exists
      if (existingBast.sppbId) {
        await tx
          .update(sppb)
          .set({
            status: "MENUNGGU_BAST",
            updatedAt: new Date(),
          })
          .where(eq(sppb.id, existingBast.sppbId));
      }
    });

    revalidatePath("/dashboard/bast-keluar");
    return { success: true, message: "BAST Keluar berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting BAST Keluar:", error);
    return {
      success: false,
      message: error.message || "Gagal menghapus BAST Keluar",
    };
  }
}

export async function toggleBastKeluarPrintStatus(id: number) {
  try {
    const existingBast = await db.query.bastKeluar.findFirst({
      where: eq(bastKeluar.id, id),
    });

    if (!existingBast) {
      return { success: false, message: "BAST Keluar tidak ditemukan" };
    }

    const newPrintStatus = !existingBast.isPrinted;

    await db
      .update(bastKeluar)
      .set({
        isPrinted: newPrintStatus,
        updatedAt: new Date(),
      })
      .where(eq(bastKeluar.id, id));

    revalidatePath("/dashboard/bast-keluar");
    revalidatePath(`/dashboard/bast-keluar/${id}`);

    return {
      success: true,
      message: `Status cetak berhasil diubah menjadi ${
        newPrintStatus ? "Sudah Dicetak" : "Belum Dicetak"
      }`,
    };
  } catch (error: any) {
    console.error("Error toggling BAST Keluar print status:", error);
    return {
      success: false,
      message: error.message || "Gagal mengubah status cetak",
    };
  }
}
