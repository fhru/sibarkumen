import { db } from '@/lib/db';
import {
  mutasiBarang,
  barang,
  spb,
  sppb,
  kategori,
  satuan,
} from '@/drizzle/schema';
import {
  sql,
  and,
  gte,
  lte,
  asc,
  desc,
  eq,
  count,
  notInArray,
  gt,
} from 'drizzle-orm';
import {
  subDays,
  subMonths,
  subYears,
  format,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameHour,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export async function getDashboardStats() {
  const [skuCount] = await db.select({ count: count() }).from(barang);

  const [pendingSpbCount] = await db
    .select({ count: count() })
    .from(spb)
    .where(eq(spb.status, 'MENUNGGU_SPPB'));

  const [pendingSppbCount] = await db
    .select({ count: count() })
    .from(sppb)
    .where(eq(sppb.status, 'MENUNGGU_BAST'));

  return {
    totalSku: skuCount?.count || 0,
    pendingSpb: pendingSpbCount?.count || 0,
    pendingSppb: pendingSppbCount?.count || 0,
  };
}

export async function getDashboardChartData(
  range: 'day' | 'week' | 'month' | 'year'
) {
  const endDate = new Date();
  let startDate = new Date();
  let dateFormat = 'dd MMM';

  switch (range) {
    case 'day':
      startDate = startOfDay(new Date());
      dateFormat = 'HH:mm';
      break;
    case 'week':
      startDate = subDays(new Date(), 6);
      dateFormat = 'dd MMM';
      break;
    case 'month':
      startDate = subMonths(new Date(), 1);
      dateFormat = 'dd MMM';
      break;
    case 'year':
      startDate = subYears(new Date(), 1);
      dateFormat = 'MMM yyyy';
      break;
  }

  const conditions = [
    gte(mutasiBarang.tanggal, startDate),
    lte(mutasiBarang.tanggal, endDate),
  ];

  let timeBucket = sql`DATE_TRUNC('day', ${mutasiBarang.tanggal})`;
  if (range === 'day') {
    timeBucket = sql`DATE_TRUNC('hour', ${mutasiBarang.tanggal})`;
  } else if (range === 'year') {
    timeBucket = sql`DATE_TRUNC('month', ${mutasiBarang.tanggal})`;
  }

  const result = await db
    .select({
      date: timeBucket,
      in: sql<number>`COALESCE(SUM(${mutasiBarang.qtyMasuk}), 0)`,
      out: sql<number>`COALESCE(SUM(${mutasiBarang.qtyKeluar}), 0)`,
    })
    .from(mutasiBarang)
    .where(and(...conditions))
    .groupBy(timeBucket)
    .orderBy(asc(timeBucket));

  // Generate continuous periods
  let periods: Date[] = [];
  try {
    if (range === 'day') {
      periods = eachHourOfInterval({ start: startDate, end: endDate });
    } else if (range === 'week' || range === 'month') {
      periods = eachDayOfInterval({ start: startDate, end: endDate });
    } else if (range === 'year') {
      periods = eachMonthOfInterval({ start: startDate, end: endDate });
    }
  } catch (e) {
    console.error('Error generating intervals', e);
    periods = [startDate, endDate];
  }

  // Merge results
  const chartData = periods.map((date) => {
    const match = result.find((r) => {
      const rDate = new Date(r.date as unknown as string);
      if (range === 'day') return isSameHour(rDate, date);
      if (range === 'year') return isSameMonth(rDate, date);
      return isSameDay(rDate, date);
    });

    return {
      name: format(date, dateFormat, { locale: localeId }),
      in: match ? Number(match.in) : 0,
      out: match ? Number(match.out) : 0,
    };
  });

  return chartData;
}

export async function getLowStockItems(limit = 5) {
  return await db.query.barang.findMany({
    where: lte(barang.stok, 5),
    orderBy: [asc(barang.stok)],
    limit: limit,
    with: {
      satuan: true,
    },
  });
}

export async function getFastMovingItems(limit = 5) {
  const thirtyDaysAgo = subDays(new Date(), 30);

  return await db
    .select({
      id: barang.id,
      nama: barang.nama,
      kodeBarang: barang.kodeBarang,
      totalQtyKeluar: sql<number>`SUM(${mutasiBarang.qtyKeluar})`,
      satuan: sql<string>`(SELECT nama FROM satuan WHERE id = ${barang.satuanId})`,
    })
    .from(mutasiBarang)
    .innerJoin(barang, eq(mutasiBarang.barangId, barang.id))
    .where(
      and(
        eq(mutasiBarang.jenisMutasi, 'KELUAR'),
        gte(mutasiBarang.tanggal, thirtyDaysAgo)
      )
    )
    .groupBy(barang.id, barang.nama, barang.kodeBarang, barang.satuanId)
    .orderBy(desc(sql`SUM(${mutasiBarang.qtyKeluar})`))
    .limit(limit);
}

export async function getDeadStockItems(limit = 5) {
  const ninetyDaysAgo = subDays(new Date(), 90);

  // Subquery for items with movement
  const activeItems = db
    .select({ id: mutasiBarang.barangId })
    .from(mutasiBarang)
    .where(
      and(
        eq(mutasiBarang.jenisMutasi, 'KELUAR'),
        gte(mutasiBarang.tanggal, ninetyDaysAgo)
      )
    );

  return await db
    .select({
      id: barang.id,
      nama: barang.nama,
      stok: barang.stok,
      satuan: sql<string>`(SELECT nama FROM satuan WHERE id = ${barang.satuanId})`,
    })
    .from(barang)
    .where(and(gt(barang.stok, 0), notInArray(barang.id, activeItems)))
    .limit(limit);
}

export async function getCategoryDistribution() {
  const result = await db
    .select({
      name: kategori.nama,
      value: sql<number>`count(${barang.id})`,
    })
    .from(barang)
    .innerJoin(kategori, eq(barang.kategoriId, kategori.id))
    .groupBy(kategori.nama)
    .orderBy(desc(sql`count(${barang.id})`));

  return result.map((item) => ({
    name: item.name,
    value: Number(item.value),
  }));
}
