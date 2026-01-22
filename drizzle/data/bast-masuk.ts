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
  exists,
} from 'drizzle-orm';

export async function getBastMasukStats() {
  // Total BAST
  const [totalResult] = await db.select({ count: count() }).from(bastMasuk);
  const totalBast = totalResult?.count ?? 0;

  // Total Nilai Transaksi
  const [nilaiResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bastMasukDetail.qty} * ${bastMasukDetail.hargaSatuan}), 0)`,
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
  sortBy: string = 'nomorReferensi',
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

  const baseFilters = [];
  let searchFilterCount = undefined;
  let searchFilterData = undefined;

  // Search filter
  if (search) {
    searchFilterCount = or(
      ilike(bastMasuk.nomorBast, `%${search}%`),
      ilike(bastMasuk.nomorReferensi, `%${search}%`),
      ilike(bastMasuk.nomorBapb, `%${search}%`),
      exists(
        db
          .select()
          .from(pihakKetiga)
          .where(
            and(
              eq(pihakKetiga.id, bastMasuk.pihakKetigaId),
              ilike(pihakKetiga.nama, `%${search}%`)
            )
          )
      )
    );

    searchFilterData = or(
      ilike(bastMasuk.nomorBast, `%${search}%`),
      ilike(bastMasuk.nomorReferensi, `%${search}%`),
      ilike(bastMasuk.nomorBapb, `%${search}%`),
      exists(
        db
          .select()
          .from(pihakKetiga)
          .where(
            and(
              eq(pihakKetiga.id, sql.raw('"bastMasuk"."pihak_ketiga_id"')),
              ilike(pihakKetiga.nama, `%${search}%`)
            )
          )
      )
    );
  }

  // Date range filter
  if (startDate) {
    baseFilters.push(
      gte(bastMasuk.tanggalBast, startDate.toISOString().split('T')[0])
    );
  }
  if (endDate) {
    baseFilters.push(
      lte(bastMasuk.tanggalBast, endDate.toISOString().split('T')[0])
    );
  }

  // ID filters
  if (pihakKetigaId) {
    baseFilters.push(eq(bastMasuk.pihakKetigaId, pihakKetigaId));
  }
  if (pptkPpkId) {
    baseFilters.push(eq(bastMasuk.pptkPpkId, pptkPpkId));
  }
  if (asalPembelianId) {
    baseFilters.push(eq(bastMasuk.asalPembelianId, asalPembelianId));
  }
  if (rekeningId) {
    baseFilters.push(eq(bastMasuk.rekeningId, rekeningId));
  }

  const whereClauseCount =
    baseFilters.length > 0 || searchFilterCount
      ? and(...baseFilters, ...(searchFilterCount ? [searchFilterCount] : []))
      : undefined;

  const whereClauseData =
    baseFilters.length > 0 || searchFilterData
      ? and(...baseFilters, ...(searchFilterData ? [searchFilterData] : []))
      : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(bastMasuk)
    .where(whereClauseCount);

  const total = totalResult?.count ?? 0;
  const pageCount = Math.ceil(total / limit);

  // Get paginated data
  const data = await db.query.bastMasuk.findMany({
    where: whereClauseData,
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
        : sortBy === 'nomorReferensi'
          ? sortOrder === 'asc'
            ? asc(bastMasuk.nomorReferensi)
            : desc(bastMasuk.nomorReferensi)
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
  try {
    const data = await db.query.bastMasuk.findFirst({
      where: eq(bastMasuk.id, id),
      with: {
        items: {
          with: {
            barang: {
              with: {
                satuan: true,
              },
            },
          },
        },
        pihakKetiga: true,
        pptkPpk: true,
        asalPembelian: true,
        rekening: true,
      },
    });

    if (!data) {
      return { success: false, message: 'Data tidak ditemukan' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching BAST Masuk:', error);
    return { success: false, message: 'Gagal mengambil data BAST Masuk' };
  }
}
