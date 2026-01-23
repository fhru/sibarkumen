'use server';

import { db } from '@/lib/db';
import {
  bastMasuk,
  bastMasukDetail,
  barang,
  pihakKetiga,
} from '@/drizzle/schema';
import { desc, eq, and, sql, gte, lte, asc, ilike } from 'drizzle-orm';

export async function getRiwayatHargaStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [totalStats] = await db
    .select({
      totalItems: sql<number>`count(*)::int`,
      totalValue: sql<string>`sum(${bastMasukDetail.qty} * ${bastMasukDetail.hargaSatuan})`,
    })
    .from(bastMasukDetail);

  const [monthStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(bastMasukDetail)
    .leftJoin(bastMasuk, eq(bastMasukDetail.bastMasukId, bastMasuk.id))
    .where(gte(bastMasuk.tanggalBast, startOfMonth));

  return {
    totalItems: totalStats?.totalItems || 0,
    totalValue: Number(totalStats?.totalValue) || 0,
    thisMonth: monthStats?.count || 0,
  };
}

export async function getRiwayatHarga(
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  sortBy: string = 'bastMasuk.tanggalBast',
  sortOrder: 'asc' | 'desc' = 'desc',
  pihakKetigaId?: number,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const filters = [];

    // Search filter
    if (search) {
      filters.push(ilike(barang.nama, `%${search}%`));
    }

    // Pihak Ketiga filter
    if (pihakKetigaId) {
      filters.push(eq(bastMasuk.pihakKetigaId, pihakKetigaId));
    }

    // Date Range filter
    if (startDate) {
      filters.push(gte(bastMasuk.tanggalBast, startDate.toISOString()));
    }
    if (endDate) {
      filters.push(lte(bastMasuk.tanggalBast, endDate.toISOString()));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Sorting logic
    let orderBy;
    const sortColumn = (() => {
      switch (sortBy) {
        case 'barang.nama':
          return barang.nama;
        case 'barang.kodeBarang':
          return barang.kodeBarang;
        case 'bastMasukDetail.hargaSatuan':
          return bastMasukDetail.hargaSatuan;
        case 'bastMasuk.tanggalBast':
          return bastMasuk.tanggalBast;
        default:
          return bastMasuk.tanggalBast;
      }
    })();

    orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Fetch data
    const data = await db
      .select({
        id: bastMasukDetail.id,
        namaBarang: barang.nama,
        kodeBarang: barang.kodeBarang,
        hargaSatuan: bastMasukDetail.hargaSatuan,
        qty: bastMasukDetail.qty,
        nomorBast: bastMasuk.nomorBast,
        tanggalBast: bastMasuk.tanggalBast,
        supplier: pihakKetiga.nama,
      })
      .from(bastMasukDetail)
      .leftJoin(bastMasuk, eq(bastMasukDetail.bastMasukId, bastMasuk.id))
      .leftJoin(barang, eq(bastMasukDetail.barangId, barang.id))
      .leftJoin(pihakKetiga, eq(bastMasuk.pihakKetigaId, pihakKetiga.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Count total
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bastMasukDetail)
      .leftJoin(bastMasuk, eq(bastMasukDetail.bastMasukId, bastMasuk.id))
      .leftJoin(barang, eq(bastMasukDetail.barangId, barang.id))
      .leftJoin(pihakKetiga, eq(bastMasuk.pihakKetigaId, pihakKetiga.id))
      .where(whereClause);

    const total = Number(countResult.count);
    const pageCount = Math.ceil(total / pageSize);

    return {
      success: true,
      data,
      meta: {
        page,
        pageSize,
        total,
        pageCount,
      },
    };
  } catch (error) {
    console.error('Error fetching price history:', error);
    return {
      success: false,
      data: [],
      meta: {
        page: 1,
        pageSize: 50,
        total: 0,
        pageCount: 1,
      },
      error: 'Failed to fetch price history',
    };
  }
}
