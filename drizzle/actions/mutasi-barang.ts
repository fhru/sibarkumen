"use server";

import { db } from "@/lib/db";
import { mutasiBarang, barang, bastKeluar, bastMasuk } from "@/drizzle/schema";
import {
  count,
  desc,
  eq,
  sql,
  and,
  gte,
  lte,
  asc,
  or,
  like,
} from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

// --- DATA FETCHING (Merged from drizzle/data/mutasi-barang.ts) ---

export async function getMutasiBarangStats() {
  // Total Qty Masuk
  const [totalMasukResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${mutasiBarang.qtyMasuk}), 0)`,
    })
    .from(mutasiBarang);
  const totalQtyMasuk = Number(totalMasukResult?.total ?? 0);

  // Total Qty Keluar
  const [totalKeluarResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${mutasiBarang.qtyKeluar}), 0)`,
    })
    .from(mutasiBarang);
  const totalQtyKeluar = Number(totalKeluarResult?.total ?? 0);

  // Total Transaksi Penyesuaian
  const [totalPenyesuaianResult] = await db
    .select({
      count: count(),
    })
    .from(mutasiBarang)
    .where(eq(mutasiBarang.jenisMutasi, "PENYESUAIAN"));
  const totalPenyesuaian = totalPenyesuaianResult?.count ?? 0;

  // Total Transaksi
  const [totalTransaksiResult] = await db
    .select({
      count: count(),
    })
    .from(mutasiBarang);
  const totalTransaksi = totalTransaksiResult?.count ?? 0;

  return {
    totalQtyMasuk,
    totalQtyKeluar,
    totalPenyesuaian,
    totalTransaksi,
  };
}

export async function getMutasiBarangList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  barangId?: number;
  jenisMutasi?: "MASUK" | "KELUAR" | "PENYESUAIAN";
  startDate?: string;
  endDate?: string;
  sumberTransaksi?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Filter by barang ID
  if (params?.barangId) {
    conditions.push(eq(mutasiBarang.barangId, params.barangId));
  }

  // Filter by jenis mutasi
  if (params?.jenisMutasi) {
    conditions.push(eq(mutasiBarang.jenisMutasi, params.jenisMutasi));
  }

  // Filter by sumber transaksi
  if (params?.sumberTransaksi) {
    conditions.push(eq(mutasiBarang.sumberTransaksi, params.sumberTransaksi));
  }

  // Filter by date range
  if (params?.startDate) {
    conditions.push(gte(mutasiBarang.tanggal, new Date(params.startDate)));
  }

  if (params?.endDate) {
    conditions.push(lte(mutasiBarang.tanggal, new Date(params.endDate)));
  }

  // Search: barang name, kode, or referensi
  if (params?.search) {
    const searchTerm = `%${params.search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${barang.nama}) LIKE ${searchTerm}`,
        sql`LOWER(${barang.kodeBarang}) LIKE ${searchTerm}`,
        sql`LOWER(COALESCE(${mutasiBarang.referensiId}, '')) LIKE ${searchTerm}`,
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(mutasiBarang)
    .innerJoin(barang, eq(mutasiBarang.barangId, barang.id))
    .where(whereClause);

  const total = totalResult?.count || 0;
  const pageCount = Math.ceil(total / limit);

  // Determine sort column and order
  let orderByClause;
  const sortOrder = params?.sortOrder || "desc";

  switch (params?.sortBy) {
    case "tanggal":
      orderByClause =
        sortOrder === "asc"
          ? [asc(mutasiBarang.tanggal), asc(mutasiBarang.id)]
          : [desc(mutasiBarang.tanggal), desc(mutasiBarang.id)];
      break;
    case "barang":
      orderByClause =
        sortOrder === "asc"
          ? [asc(barang.nama), asc(mutasiBarang.id)]
          : [desc(barang.nama), desc(mutasiBarang.id)];
      break;
    default:
      orderByClause = [desc(mutasiBarang.tanggal), desc(mutasiBarang.id)];
  }

  // Get paginated data using query builder for proper join
  const data = await db
    .select({
      id: mutasiBarang.id,
      barangId: mutasiBarang.barangId,
      tanggal: mutasiBarang.tanggal,
      jenisMutasi: mutasiBarang.jenisMutasi,
      qtyMasuk: mutasiBarang.qtyMasuk,
      qtyKeluar: mutasiBarang.qtyKeluar,
      stokAkhir: mutasiBarang.stokAkhir,
      referensiId: mutasiBarang.referensiId,
      sumberTransaksi: mutasiBarang.sumberTransaksi,
      keterangan: mutasiBarang.keterangan,
      bastKeluarId: bastKeluar.id,
      bastMasukId: bastMasuk.id,
      barang: {
        id: barang.id,
        nama: barang.nama,
        kodeBarang: barang.kodeBarang,
      },
    })
    .from(mutasiBarang)
    .innerJoin(barang, eq(mutasiBarang.barangId, barang.id))
    .leftJoin(bastKeluar, eq(bastKeluar.nomorBast, mutasiBarang.referensiId))
    .leftJoin(bastMasuk, eq(bastMasuk.nomorBast, mutasiBarang.referensiId))
    .where(whereClause)
    .orderBy(...orderByClause)
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

export async function getMutasiBarangById(id: number) {
  const data = await db.query.mutasiBarang.findFirst({
    where: eq(mutasiBarang.id, id),
    with: {
      barang: {
        columns: {
          id: true,
          nama: true,
          kodeBarang: true,
          stok: true,
        },
      },
    },
  });

  return data;
}

// --- PREVIOUSLY EXPORTED ACTIONS (Wrappers) ---

export async function getMutasiBarang(filters?: {
  barangId?: number;
  jenisMutasi?: "MASUK" | "KELUAR" | "PENYESUAIAN";
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    await checkAuth();

    // Convert Date to string for getMutasiBarangList
    const params = {
      barangId: filters?.barangId,
      jenisMutasi: filters?.jenisMutasi,
      startDate: filters?.startDate?.toISOString().split("T")[0],
      endDate: filters?.endDate?.toISOString().split("T")[0],
    };

    const result = await getMutasiBarangList(params);
    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data mutasi",
      data: [],
    };
  }
}

export async function getMutasiBarangDetail(id: number) {
  try {
    await checkAuth();
    const data = await getMutasiBarangById(id);
    if (!data) {
      return { success: false, message: "Data tidak ditemukan" };
    }
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil detail mutasi",
    };
  }
}

export async function getStatsMutasiBarang() {
  try {
    await checkAuth();
    const stats = await getMutasiBarangStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil statistik",
    };
  }
}
