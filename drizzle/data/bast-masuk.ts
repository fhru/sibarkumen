import { db } from '@/lib/db';
import { bastMasuk, bastMasukDetail, pihakKetiga } from '@/drizzle/schema';
import { count, desc, eq, sql, sum } from 'drizzle-orm';

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

export async function getBastMasukList() {
  const data = await db.query.bastMasuk.findMany({
    with: {
      pihakKetiga: true,
      pptkPpk: true,
      asalPembelian: true,
    },
    orderBy: [desc(bastMasuk.createdAt)],
  });

  return data;
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
