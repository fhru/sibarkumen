import { db } from '@/lib/db';
import { bastMasuk, bastMasukDetail, pihakKetiga } from '@/drizzle/schema';
import {
  count,
  desc,
  asc,
  eq,
  sql,
  sum,
  or,
  and,
  ilike,
  gte,
  lte,
} from 'drizzle-orm';

export async function getBastMasukStats() {
  // Total BAST
  const [totalResult] = await db.select({ count: count() }).from(bastMasuk);
  const totalBast = totalResult?.count ?? 0;

  // Total Nilai Transaksi
  const [nilaiResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bastMasukDetail.qtyTotal} * ${bastMasukDetail.hargaSatuan}), 0)`,
    })
    .from(bastMasukDetail);
  const totalNilaiTransaksi = Number(nilaiResult?.total ?? 0);

  // Supplier Terbanyak
  const topSupplierResult = await db
    .select({
      supplierNama: pihakKetiga.nama,
      count: count(bastMasuk.id),
    })
    .from(bastMasuk)
    .leftJoin(pihakKetiga, eq(bastMasuk.pihakKetigaId, pihakKetiga.id))
    .groupBy(pihakKetiga.nama)
    .orderBy(desc(count(bastMasuk.id)))
    .limit(1);

  const supplierTerbanyak = topSupplierResult[0]
    ? `${topSupplierResult[0].supplierNama} (${topSupplierResult[0].count})`
    : '-';

  return {
    totalBast,
    totalNilaiTransaksi,
    supplierTerbanyak,
  };
}

export async function getBastMasukList(
  page: number = 1,
  limit: number = 50,
  search?: string,
  sortBy: string = 'tanggalBast',
  sortOrder: 'asc' | 'desc' = 'desc',
  // Filters
  pihakKetigaId?: number,
  pptkPpkId?: number,
  asalPembelianId?: number,
  rekeningId?: number,
  startDate?: Date,
  endDate?: Date
) {
  const offset = (page - 1) * limit;

  const filters = [];

  // Search filter
  if (search) {
    filters.push(
      or(
        ilike(bastMasuk.nomorBast, `%${search}%`),
        ilike(bastMasuk.nomorReferensi, `%${search}%`),
        ilike(bastMasuk.nomorBapb, `%${search}%`)
      )
    );
  }

  // Date range filter
  if (startDate) {
    filters.push(
      gte(bastMasuk.tanggalBast, startDate.toISOString().split('T')[0])
    );
  }
  if (endDate) {
    filters.push(
      lte(bastMasuk.tanggalBast, endDate.toISOString().split('T')[0])
    );
  }

  // ID filters
  if (pihakKetigaId) {
    filters.push(eq(bastMasuk.pihakKetigaId, pihakKetigaId));
  }
  if (pptkPpkId) {
    filters.push(eq(bastMasuk.pptkPpkId, pptkPpkId));
  }
  if (asalPembelianId) {
    filters.push(eq(bastMasuk.asalPembelianId, asalPembelianId));
  }
  if (rekeningId) {
    filters.push(eq(bastMasuk.rekeningId, rekeningId));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(bastMasuk)
    .where(whereClause);

  const total = totalResult?.count ?? 0;
  const pageCount = Math.ceil(total / limit);

  // Get paginated data
  const data = await db.query.bastMasuk.findMany({
    where: whereClause,
    with: {
      pihakKetiga: true,
      pptkPpk: true,
      asalPembelian: true,
      rekening: true,
    },
    orderBy:
      sortBy === 'nomorBast'
        ? sortOrder === 'asc'
          ? asc(bastMasuk.nomorBast)
          : desc(bastMasuk.nomorBast)
        : sortBy === 'tanggalBast'
          ? sortOrder === 'asc'
            ? asc(bastMasuk.tanggalBast)
            : desc(bastMasuk.tanggalBast)
          : sortOrder === 'asc'
            ? asc(bastMasuk.createdAt)
            : desc(bastMasuk.createdAt),
    limit,
    offset,
  });

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

export async function getBastMasukById(id: number) {
  const data = await db.query.bastMasuk.findFirst({
    where: eq(bastMasuk.id, id),
    with: {
      items: {
        with: {
          barang: true,
          satuanKemasan: true,
        },
      },
      pihakKetiga: true,
      pptkPpk: true,
      asalPembelian: true,
      rekening: true,
    },
  });

  return data;
}
