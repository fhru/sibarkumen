import { db } from '@/lib/db';
import { barang, kategori, satuan } from '@/drizzle/schema';
import {
  count,
  desc,
  asc,
  eq,
  ilike,
  or,
  and,
  inArray,
  lte,
  gt,
  sql,
} from 'drizzle-orm';

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
    : '-';

  return {
    totalItems,
    lowStockCount,
    topCategory,
  };
}

export async function getBarangList(
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: string = 'updatedAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  categoryIds?: number[],
  status?: string // 'available' | 'low' | 'out'
) {
  const offset = (page - 1) * limit;

  const filters = [];

  if (search) {
    filters.push(
      or(
        ilike(barang.nama, `%${search}%`),
        ilike(barang.kodeBarang, `%${search}%`)
      )
    );
  }

  if (categoryIds && categoryIds.length > 0) {
    filters.push(inArray(barang.kategoriId, categoryIds));
  }

  if (status) {
    if (status === 'out') {
      filters.push(eq(barang.stok, 0));
    } else if (status === 'low') {
      filters.push(and(gt(barang.stok, 0), lte(barang.stok, 5)));
    } else if (status === 'available') {
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
      sortBy === 'nama'
        ? sortOrder === 'asc'
          ? asc(barang.nama)
          : desc(barang.nama)
        : sortBy === 'kodeBarang'
          ? sortOrder === 'asc'
            ? asc(barang.kodeBarang)
            : desc(barang.kodeBarang)
          : sortBy === 'stok'
            ? sortOrder === 'asc'
              ? asc(barang.stok)
              : desc(barang.stok)
            : sortOrder === 'asc'
              ? asc(barang.updatedAt)
              : desc(barang.updatedAt)
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
