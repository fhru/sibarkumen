"use server";

import { db } from "@/lib/db";
import {
  bastKeluar,
  bastKeluarDetail,
  sppb,
  barang,
  mutasiBarang,
} from "@/drizzle/schema";
import { eq, ilike, and, gte, lte, desc, asc, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateBastKeluarNumberFromSPB } from "./generate-number";
import { generateDocumentNumberWithRetry } from "@/lib/document-numbering-utils";
import {
  bastKeluarFormSchema,
  bastKeluarItemSchema,
} from "@/lib/zod/bast-keluar-schema";
import { Role } from "@/config/nav-items";

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
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      return {
        success: false,
        message: "Supervisor tidak diizinkan membuat BAST Keluar",
      };
    }

    const validated = bastKeluarFormSchema.parse(data);

    // Verify SPPB exists and is completed
    const sppbData = await db.query.sppb.findFirst({
      where: eq(sppb.id, validated.sppbId),
      with: {
        spb: {
          columns: {
            nomorSpb: true,
          },
        },
      },
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
      let nomorBast = sppbData.spb?.nomorSpb
        ? await generateBastKeluarNumberFromSPB(sppbData.spb.nomorSpb)
        : await generateDocumentNumberWithRetry("bastKeluar");

      if (sppbData.spb?.nomorSpb) {
        const exists = await tx
          .select({ id: bastKeluar.id })
          .from(bastKeluar)
          .where(eq(bastKeluar.nomorBast, nomorBast))
          .limit(1);

        if (exists.length > 0) {
          nomorBast = await generateDocumentNumberWithRetry("bastKeluar");
        }
      }

      // Create BAST Keluar Header
      const [newBast] = await tx
        .insert(bastKeluar)
        .values({
          nomorBast,
          tanggalBast: tglBast,
          sppbId: validated.sppbId,
          pihakPertamaId: validated.pihakPertamaId,
          jabatanPihakPertamaId: validated.jabatanPihakPertamaId,
          pihakKeduaId: validated.pihakKeduaId,
          jabatanPihakKeduaId: validated.jabatanPihakKeduaId,
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
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      return {
        success: false,
        message: "Supervisor tidak diizinkan mengubah BAST Keluar",
      };
    }

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
      const oldDetails = await tx.query.bastKeluarDetail.findMany({
        where: eq(bastKeluarDetail.bastKeluarId, id),
      });

      const oldQtyMap = new Map<number, number>();
      for (const item of oldDetails) {
        oldQtyMap.set(
          item.barangId,
          (oldQtyMap.get(item.barangId) || 0) + item.qtySerahTerima,
        );
      }

      const newQtyMap = new Map<number, number>();
      for (const item of validated.items) {
        newQtyMap.set(
          item.barangId,
          (newQtyMap.get(item.barangId) || 0) + item.qtySerahTerima,
        );
      }

      const affectedBarangIds = new Set<number>([
        ...oldQtyMap.keys(),
        ...newQtyMap.keys(),
      ]);

      // Adjust stock and create mutasi based on delta between old and new quantities
      for (const barangId of affectedBarangIds) {
        const oldQty = oldQtyMap.get(barangId) || 0;
        const newQty = newQtyMap.get(barangId) || 0;
        const delta = newQty - oldQty;

        if (delta === 0) continue;

        const [currentBarang] = await tx
          .select({ stok: barang.stok, nama: barang.nama })
          .from(barang)
          .where(eq(barang.id, barangId));

        const currentStock = currentBarang?.stok || 0;
        const newStock = currentStock - delta;

        if (delta > 0 && newStock < 0) {
          throw new Error(
            `Stok barang "${currentBarang?.nama || "Unknown"}" tidak cukup. Stok saat ini (${currentStock}), tambahan dibutuhkan ${delta}.`,
          );
        }

        await tx
          .update(barang)
          .set({ stok: newStock })
          .where(eq(barang.id, barangId));

        await tx.insert(mutasiBarang).values({
          barangId,
          tanggal: new Date(),
          jenisMutasi: delta > 0 ? "KELUAR" : "PENYESUAIAN",
          qtyMasuk: delta < 0 ? Math.abs(delta) : 0,
          qtyKeluar: delta > 0 ? delta : 0,
          stokAkhir: newStock,
          referensiId: existingBast.nomorBast,
          sumberTransaksi: "EDIT_BAST_KELUAR",
          keterangan:
            delta > 0
              ? `Penambahan qty BAST ${existingBast.nomorBast}`
              : `Pengurangan qty BAST ${existingBast.nomorBast}`,
        });
      }

      // Update BAST Keluar Header
      await tx
        .update(bastKeluar)
        .set({
          tanggalBast: tglBast,
          pihakPertamaId: validated.pihakPertamaId,
          jabatanPihakPertamaId: validated.jabatanPihakPertamaId,
          pihakKeduaId: validated.pihakKeduaId,
          jabatanPihakKeduaId: validated.jabatanPihakKeduaId,
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
    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      return {
        success: false,
        message: "Supervisor tidak diizinkan menghapus BAST Keluar",
      };
    }

    const existingBast = await db.query.bastKeluar.findFirst({
      where: eq(bastKeluar.id, id),
    });

    if (!existingBast) {
      return { success: false, message: "BAST Keluar tidak ditemukan" };
    }

    await db.transaction(async (tx) => {
      const details = await tx.query.bastKeluarDetail.findMany({
        where: eq(bastKeluarDetail.bastKeluarId, id),
      });

      for (const item of details) {
        const [currentBarang] = await tx
          .select({ stok: barang.stok, nama: barang.nama })
          .from(barang)
          .where(eq(barang.id, item.barangId));

        const currentStock = currentBarang?.stok || 0;
        const newStock = currentStock + item.qtySerahTerima;

        await tx
          .update(barang)
          .set({ stok: newStock })
          .where(eq(barang.id, item.barangId));

        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          tanggal: new Date(),
          jenisMutasi: "PENYESUAIAN",
          qtyMasuk: item.qtySerahTerima,
          qtyKeluar: 0,
          stokAkhir: newStock,
          referensiId: existingBast.nomorBast,
          sumberTransaksi: "PEMBATALAN_BAST_KELUAR",
          keterangan: `Pembatalan BAST ${existingBast.nomorBast}`,
        });
      }

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

// --- DATA FETCHING (Previously in drizzle/data/bast-keluar.ts) ---

export async function getBastKeluarStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [totalStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      totalValue: sql<string>`sum(${bastKeluar.grandTotal})`,
    })
    .from(bastKeluar);

  const [monthStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(bastKeluar)
    .where(gte(bastKeluar.tanggalBast, startOfMonth));

  return {
    total: totalStats?.total || 0,
    totalValue: Number(totalStats?.totalValue) || 0,
    thisMonth: monthStats?.count || 0,
  };
}

export async function getBastKeluarList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isPrinted?: boolean;
  sppbId?: number;
  startDate?: string;
  endDate?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Filter by SPPB
  if (params?.sppbId) {
    conditions.push(eq(bastKeluar.sppbId, params.sppbId));
  }

  // Filter by Printed Status
  if (params?.isPrinted !== undefined) {
    conditions.push(eq(bastKeluar.isPrinted, params.isPrinted));
  }

  // Filter by date range
  if (params?.startDate) {
    conditions.push(gte(bastKeluar.tanggalBast, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(bastKeluar.tanggalBast, params.endDate));
  }

  // Search: nomor BAST or nomor SPPB
  if (params?.search) {
    const searchTerm = `%${params.search}%`;
    conditions.push(
      or(
        ilike(bastKeluar.nomorBast, searchTerm),
        sql`exists (
          select 1
          from "sppb"
          where "sppb"."id" = ${bastKeluar.sppbId}
            and "sppb"."nomor_sppb" ILIKE ${searchTerm}
        )`,
      ),
    );
  }

  // Build WHERE clause
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortOrder = params?.sortOrder || "desc";
  let orderByClause;

  switch (params?.sortBy) {
    case "nomorBast":
      orderByClause =
        sortOrder === "asc"
          ? [asc(bastKeluar.nomorBast), asc(bastKeluar.id)]
          : [desc(bastKeluar.nomorBast), desc(bastKeluar.id)];
      break;
    case "tanggalBast":
      orderByClause =
        sortOrder === "asc"
          ? [asc(bastKeluar.tanggalBast), asc(bastKeluar.id)]
          : [desc(bastKeluar.tanggalBast), desc(bastKeluar.id)];
      break;
    default:
      orderByClause = [desc(bastKeluar.nomorBast), desc(bastKeluar.id)];
  }

  // Fetch data
  const data = await db.query.bastKeluar.findMany({
    where: whereClause,
    with: {
      sppb: {
        columns: {
          id: true,
          nomorSppb: true,
          tanggalSppb: true,
        },
      },
      pihakPertama: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
        with: {
          pegawaiJabatan: {
            where: (pj: any, { eq }: any) => eq(pj.isAktif, true),
            with: {
              jabatan: {
                columns: {
                  nama: true,
                },
              },
            },
          },
        },
      },
      jabatanPihakPertama: {
        columns: {
          nama: true,
          unitKerja: true,
        },
      },
      pihakKedua: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      jabatanPihakKedua: {
        columns: {
          nama: true,
          unitKerja: true,
        },
      },
    },
    orderBy: orderByClause,
    limit,
    offset,
  });

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bastKeluar)
    .where(whereClause);

  const totalPages = Math.ceil(count / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
    },
  };
}

export async function getBastKeluarById(id: number) {
  const data = await db.query.bastKeluar.findFirst({
    where: eq(bastKeluar.id, id),
    with: {
      sppb: {
        columns: {
          id: true,
          nomorSppb: true,
          tanggalSppb: true,
          spbId: true,
        },
        with: {
          spb: {
            columns: {
              id: true,
              nomorSpb: true,
            },
          },
        },
      },
      pihakPertama: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
        with: {
          pegawaiJabatan: {
            where: (pj: any, { eq }: any) => eq(pj.isAktif, true),
            with: {
              jabatan: {
                columns: {
                  nama: true,
                },
              },
            },
          },
        },
      },
      jabatanPihakPertama: {
        columns: {
          nama: true,
          unitKerja: true,
        },
      },
      pihakKedua: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      jabatanPihakKedua: {
        columns: {
          nama: true,
          unitKerja: true,
        },
      },
      items: {
        with: {
          barang: {
            columns: {
              id: true,
              nama: true,
              kodeBarang: true,
            },
            with: {
              satuan: {
                columns: {
                  nama: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!data) {
    return {
      success: false,
      message: "BAST Keluar tidak ditemukan",
      data: null,
    };
  }

  return { success: true, data };
}
