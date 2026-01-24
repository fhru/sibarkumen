"use server";

import { db } from "@/lib/db";
import {
  barang,
  kategori,
  satuan,
  bastMasuk,
  bastMasukDetail,
} from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  eq,
  desc,
  and,
  like,
  count,
  asc,
  ilike,
  or,
  inArray,
  lte,
  gt,
  sql,
} from "drizzle-orm";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/config/nav-items";

// --- ACTIONS ---

import { createBarangSchema, updateBarangSchema } from "@/lib/zod/barang";

export async function createBarang(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createBarangSchema.parse(rawData);

    const session = await getSession();
    const userRole = (session?.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      throw new Error("Supervisor tidak dapat menambah barang");
    }

    let newKodeBarang = "";

    await db.transaction(async (tx) => {
      // Ambil prefix kategori
      const [kategoriData] = await tx
        .select({ prefix: kategori.prefix })
        .from(kategori)
        .where(eq(kategori.id, validatedData.kategoriId))
        .limit(1);

      if (!kategoriData) {
        throw new Error("Kategori tidak ditemukan");
      }

      const prefix = kategoriData.prefix;

      // Cari barang terakhir dengan prefix yang sama
      // Kita cari yang formatnya PREFIX.%
      const [latestBarang] = await tx
        .select({ kodeBarang: barang.kodeBarang })
        .from(barang)
        .where(like(barang.kodeBarang, `${prefix}.%`))
        .orderBy(desc(barang.id)) // Asumsi ID increment sejalan dengan waktu
        .limit(1);

      // Logic Generator Nomor
      let nextNumber = 1;
      if (latestBarang) {
        // Format: PRE.1234
        const parts = latestBarang.kodeBarang.split(".");
        if (parts.length >= 2) {
          const lastNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }

      // Format Kode Baru: PREFIX.0001
      newKodeBarang = `${prefix}.${nextNumber.toString().padStart(4, "0")}`;

      // Insert ke Database
      await tx.insert(barang).values({
        nama: validatedData.nama,
        kodeBarang: newKodeBarang,
        stok: 0,
        kategoriId: validatedData.kategoriId,
        satuanId: validatedData.satuanId,
        spesifikasi: validatedData.spesifikasi || null,
      });
    });

    revalidatePath("/dashboard/barang");
    return {
      success: true,
      message: `Barang berhasil ditambahkan with kode ${newKodeBarang}`,
    };
  } catch (error: any) {
    console.error("Failed to create barang:", error);

    // Handle Zod Error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: error.flatten().fieldErrors,
      };
    }

    // Handle Error Database (Misal Kode Unik Duplicate)
    if (
      error.code === "23505" ||
      error.message?.includes("Unique constraint") ||
      error.message?.includes("duplicate key") ||
      error.message?.includes("Failed query")
    ) {
      return {
        success: false,
        message:
          "Nama barang sudah ada (duplikat) atau Kode Barang bentrok. Silakan coba lagi.",
      };
    }

    return {
      success: false,
      message: error.message || "Gagal menambahkan barang.",
    };
  }
}

export async function updateBarang(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateBarangSchema.parse(rawData);

    const session = await getSession();
    const userRole = (session?.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      throw new Error("Supervisor tidak dapat mengubah data barang");
    }

    await db
      .update(barang)
      .set({
        nama: validatedData.nama,
        stok: validatedData.stok,
        kategoriId: validatedData.kategoriId,
        satuanId: validatedData.satuanId,
        spesifikasi: validatedData.spesifikasi || null,
        updatedAt: new Date(),
      })
      .where(eq(barang.id, validatedData.id));

    revalidatePath("/dashboard/barang");
    return { success: true, message: "Barang berhasil diperbarui" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Gagal validasi data",
        errors: error.flatten().fieldErrors,
      };
    }
    if (
      error.code === "23505" ||
      error.message?.includes("duplicate key") ||
      error.message?.includes("unique constraint") ||
      error.message?.includes("Failed query")
    ) {
      return {
        success: false,
        message: "Nama barang sudah ada (duplikat)",
      };
    }
    return {
      success: false,
      message: "Gagal memperbarui barang: " + error.message,
    };
  }
}

export async function deleteBarang(id: number) {
  try {
    const session = await getSession();
    const userRole = (session?.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      throw new Error("Supervisor tidak dapat menghapus barang");
    }

    await db.delete(barang).where(eq(barang.id, id));
    revalidatePath("/dashboard/barang");
    return { success: true, message: "Barang berhasil dihapus" };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus barang: " + error.message,
    };
  }
}

// --- DATA FETCHING (Previously in drizzle/data/barang.ts) ---

export async function getLastPurchasePrice(barangId: number) {
  const result = await db
    .select({
      hargaSatuan: bastMasukDetail.hargaSatuan,
      tanggalBast: bastMasuk.tanggalBast,
    })
    .from(bastMasukDetail)
    .leftJoin(bastMasuk, eq(bastMasukDetail.bastMasukId, bastMasuk.id))
    .where(eq(bastMasukDetail.barangId, barangId))
    .orderBy(desc(bastMasuk.tanggalBast))
    .limit(1);

  return result[0];
}

export async function getBarangStats() {
  const [totalResult] = await db.select({ count: count() }).from(barang);
  const totalItems = totalResult?.count ?? 0;

  const [lowStockResult] = await db
    .select({ count: count() })
    .from(barang)
    .where(and(gt(barang.stok, 0), lte(barang.stok, 5)));
  const lowStockCount = lowStockResult?.count ?? 0;

  // Top Category
  const topCategoryResult = await db
    .select({
      kategoriNama: kategori.nama,
      count: count(barang.id),
    })
    .from(barang)
    .leftJoin(kategori, eq(barang.kategoriId, kategori.id))
    .groupBy(kategori.nama)
    .orderBy(desc(count(barang.id)))
    .limit(1);

  const topCategory = topCategoryResult[0]
    ? `${topCategoryResult[0].kategoriNama} (${topCategoryResult[0].count})`
    : "-";

  return {
    totalItems,
    lowStockCount,
    topCategory,
  };
}

export async function getBarangList(
  page: number = 1,
  limit: number = 25,
  search?: string,
  sortBy: string = "updatedAt",
  sortOrder: "asc" | "desc" = "desc",
  categoryIds?: number[],
  status?: string, // 'available' | 'low' | 'out'
) {
  const offset = (page - 1) * limit;

  const filters = [];

  if (search) {
    filters.push(
      or(
        ilike(barang.nama, `%${search}%`),
        ilike(barang.kodeBarang, `%${search}%`),
      ),
    );
  }

  if (categoryIds && categoryIds.length > 0) {
    filters.push(inArray(barang.kategoriId, categoryIds));
  }

  if (status) {
    if (status === "out") {
      filters.push(eq(barang.stok, 0));
    } else if (status === "low") {
      filters.push(and(gt(barang.stok, 0), lte(barang.stok, 5)));
    } else if (status === "available") {
      filters.push(gt(barang.stok, 0));
    }
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(barang)
    .where(whereClause);

  const total = totalResult?.count ?? 0;
  const pageCount = Math.ceil(total / limit);

  const data = await db
    .select({
      id: barang.id,
      nama: barang.nama,
      kodeBarang: barang.kodeBarang,
      stok: barang.stok,
      spesifikasi: barang.spesifikasi,
      kategoriId: barang.kategoriId,
      satuanId: barang.satuanId,
      kategori: kategori.nama,
      satuan: satuan.nama,
      updatedAt: barang.updatedAt,
    })
    .from(barang)
    .leftJoin(kategori, eq(barang.kategoriId, kategori.id))
    .leftJoin(satuan, eq(barang.satuanId, satuan.id))
    .where(whereClause)
    .orderBy(
      sortBy === "nama"
        ? sortOrder === "asc"
          ? asc(barang.nama)
          : desc(barang.nama)
        : sortBy === "kodeBarang"
          ? sortOrder === "asc"
            ? asc(barang.kodeBarang)
            : desc(barang.kodeBarang)
          : sortBy === "stok"
            ? sortOrder === "asc"
              ? asc(barang.stok)
              : desc(barang.stok)
            : sortOrder === "asc"
              ? asc(barang.updatedAt)
              : desc(barang.updatedAt),
    )
    .limit(limit)
    .offset(offset);

  return {
    data,
    meta: {
      total,
      pageCount,
      page,
      limit,
    },
  };
}
