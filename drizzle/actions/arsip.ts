'use server';

import { db } from '@/lib/db';
import {
  bastMasuk,
  spb,
  sppb,
  bastKeluar,
  stockOpname,
} from '@/drizzle/schema';
import { desc, eq, like, or, and, sql } from 'drizzle-orm';

export interface ArsipDocument {
  id: string; // Composite: TYPE-ID
  originalId: number;
  tipe: 'BAST_MASUK' | 'SPB' | 'SPPB' | 'BAST_KELUAR' | 'STOCK_OPNAME';
  nomor: string;
  tanggal: Date;
  keterangan: string | null;
  status: string | null;
  link: string;
  creator?: string;
}

export async function fetchArsipDocuments(
  searchQuery: string = '',
  tipeFilter: string | undefined = undefined,
  startDate: Date | undefined = undefined,
  endDate: Date | undefined = undefined
) {
  // Parallel fetch for all types
  // Note: We could optimize this with raw SQL UNION, but Drizzle relations are nice.
  // Given potential volume, pagination might be needed later, but for now we fetch all (with limits if needed).

  const limit = 100; // Hard limit per type to prevent explosion? Or pagination logic.
  // For 'Archive', users usually want to see recent stuff or search specific.
  // I will implement simple fetch all recent 50 from each, or search.
  // If search is active, we search all.

  // Helper to build where clause
  const buildWhere = (table: any, nomorColumn: any, tanggalColumn: any) => {
    const conditions = [];
    if (searchQuery) {
      conditions.push(like(nomorColumn, `%${searchQuery}%`));
    }
    if (startDate) {
      conditions.push(sql`${tanggalColumn} >= ${startDate.toISOString()}`); // Drizzle handling of date might need care, usually object is fine if eq
      // Actually range:
      // gte(tanggalColumn, startDate)
    }
    // ... Simplified for now: mainly Search.

    // Allow complex date logic later.
    return searchQuery ? like(nomorColumn, `%${searchQuery}%`) : undefined;
  };

  const queries = [];

  // 1. BAST Masuk
  if (!tipeFilter || tipeFilter === 'BAST_MASUK') {
    queries.push(
      db.query.bastMasuk.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorBast, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalBast)],
        limit: 50,
        with: {
          // relations...
        },
      })
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 2. SPB
  if (!tipeFilter || tipeFilter === 'SPB') {
    queries.push(
      db.query.spb.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorSpb, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalSpb)],
        limit: 50,
      })
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 3. SPPB
  if (!tipeFilter || tipeFilter === 'SPPB') {
    queries.push(
      db.query.sppb.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorSppb, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalSppb)],
        limit: 50,
      })
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 4. BAST Keluar
  if (!tipeFilter || tipeFilter === 'BAST_KELUAR') {
    queries.push(
      db.query.bastKeluar.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorBast, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalBast)],
        limit: 50,
      })
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 5. Stock Opname
  if (!tipeFilter || tipeFilter === 'STOCK_OPNAME') {
    queries.push(
      db.query.stockOpname.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomor, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggal)],
        limit: 50,
      })
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  const [bastMasukData, spbData, sppbData, bastKeluarData, stockOpnameData] =
    await Promise.all(queries);

  // Map to unified format
  const results: ArsipDocument[] = [];

  // @ts-ignore - types mismatch slightly between tables, explicit mapping fixes it
  bastMasukData.forEach((item: any) => {
    results.push({
      id: `BAST_MASUK-${item.id}`,
      originalId: item.id,
      tipe: 'BAST_MASUK',
      nomor: item.nomorBast, // Note: BAST Masuk has nomorRefernsi too, strictly using nomorBast here
      tanggal: new Date(item.tanggalBast),
      keterangan: item.keterangan || '-',
      status: 'Selesai', // BAST entry is considered complete upon creation usually
      link: `/dashboard/bast-masuk/${item.id}`,
    });
  });

  spbData.forEach((item: any) => {
    results.push({
      id: `SPB-${item.id}`,
      originalId: item.id,
      tipe: 'SPB',
      nomor: item.nomorSpb,
      tanggal: new Date(item.tanggalSpb),
      keterangan: item.keterangan || '-',
      status: item.status,
      link: `/dashboard/spb/${item.id}`, // Adjust logic if needed (SPB page?)
    });
  });

  sppbData.forEach((item: any) => {
    results.push({
      id: `SPPB-${item.id}`,
      originalId: item.id,
      tipe: 'SPPB',
      nomor: item.nomorSppb,
      tanggal: new Date(item.tanggalSppb),
      keterangan: item.keterangan || '-',
      status: item.status,
      link: `/dashboard/sppb/${item.id}`, // Assuming existing route structure
    });
  });

  bastKeluarData.forEach((item: any) => {
    results.push({
      id: `BAST_KELUAR-${item.id}`,
      originalId: item.id,
      tipe: 'BAST_KELUAR',
      nomor: item.nomorBast,
      tanggal: new Date(item.tanggalBast),
      keterangan: item.keterangan || '-',
      status: 'Selesai',
      link: `/dashboard/bast-keluar/${item.id}`, // Adjust route
    });
  });

  stockOpnameData.forEach((item: any) => {
    results.push({
      id: `STOCK_OPNAME-${item.id}`,
      originalId: item.id,
      tipe: 'STOCK_OPNAME',
      nomor: item.nomor,
      tanggal: new Date(item.tanggal),
      keterangan: item.keterangan || '-',
      status: item.status,
      link: `/dashboard/stock-opname/${item.id}`,
    });
  });

  // Sort Descending by Date
  results.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

  return results;
}
