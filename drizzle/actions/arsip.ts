"use server";

import { db } from "@/lib/db";
import { spb, sppb, bastMasuk, bastKeluar } from "@/drizzle/schema";
import { like, sql, count } from "drizzle-orm";

export interface ArsipDocument {
  id: string; // Composite: TYPE-ID
  originalId: number;
  tipe: "BAST_MASUK" | "SPB" | "SPPB" | "BAST_KELUAR" | "STOCK_OPNAME";
  nomor: string;
  tanggal: Date;
  keterangan: string | null;
  status: string | null;
  link: string;
  creator?: string;
}

export async function fetchArsipDocuments(
  searchQuery: string = "",
  tipeFilter: string | undefined = undefined,
  startDate: Date | undefined = undefined,
  endDate: Date | undefined = undefined,
) {
  const limit = 100;

  // Helper to build where clause
  const buildWhere = (table: any, nomorColumn: any, tanggalColumn: any) => {
    const conditions = [];
    if (searchQuery) {
      conditions.push(like(nomorColumn, `%${searchQuery}%`));
    }
    if (startDate) {
      conditions.push(sql`${tanggalColumn} >= ${startDate.toISOString()}`);
    }

    return searchQuery ? like(nomorColumn, `%${searchQuery}%`) : undefined;
  };

  const queries = [];

  // 1. BAST Masuk
  if (!tipeFilter || tipeFilter === "BAST_MASUK") {
    queries.push(
      db.query.bastMasuk.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorBast, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalBast)],
        limit: 50,
        with: {
          // relations...
        },
      }),
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 2. SPB
  if (!tipeFilter || tipeFilter === "SPB") {
    queries.push(
      db.query.spb.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorSpb, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalSpb)],
        limit: 50,
      }),
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 3. SPPB
  if (!tipeFilter || tipeFilter === "SPPB") {
    queries.push(
      db.query.sppb.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorSppb, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalSppb)],
        limit: 50,
      }),
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 4. BAST Keluar
  if (!tipeFilter || tipeFilter === "BAST_KELUAR") {
    queries.push(
      db.query.bastKeluar.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomorBast, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggalBast)],
        limit: 50,
      }),
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  // 5. Stock Opname
  if (!tipeFilter || tipeFilter === "STOCK_OPNAME") {
    queries.push(
      db.query.stockOpname.findMany({
        where: (t, { like }) =>
          searchQuery ? like(t.nomor, `%${searchQuery}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.tanggal)],
        limit: 50,
      }),
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  const [bastMasukData, spbData, sppbData, bastKeluarData, stockOpnameData] =
    await Promise.all(queries);

  // Map to unified format
  const results: ArsipDocument[] = [];

  bastMasukData.forEach((item: any) => {
    results.push({
      id: `BAST_MASUK-${item.id}`,
      originalId: item.id,
      tipe: "BAST_MASUK",
      nomor: item.nomorBast,
      tanggal: new Date(item.tanggalBast),
      keterangan: item.keterangan || "-",
      status: "Selesai",
      link: `/dashboard/bast-masuk/${item.id}`,
    });
  });

  spbData.forEach((item: any) => {
    results.push({
      id: `SPB-${item.id}`,
      originalId: item.id,
      tipe: "SPB",
      nomor: item.nomorSpb,
      tanggal: new Date(item.tanggalSpb),
      keterangan: item.keterangan || "-",
      status: item.status,
      link: `/dashboard/spb/${item.id}`,
    });
  });

  sppbData.forEach((item: any) => {
    results.push({
      id: `SPPB-${item.id}`,
      originalId: item.id,
      tipe: "SPPB",
      nomor: item.nomorSppb,
      tanggal: new Date(item.tanggalSppb),
      keterangan: item.keterangan || "-",
      status: item.status,
      link: `/dashboard/sppb/${item.id}`,
    });
  });

  bastKeluarData.forEach((item: any) => {
    results.push({
      id: `BAST_KELUAR-${item.id}`,
      originalId: item.id,
      tipe: "BAST_KELUAR",
      nomor: item.nomorBast,
      tanggal: new Date(item.tanggalBast),
      keterangan: item.keterangan || "-",
      status: "Selesai",
      link: `/dashboard/bast-keluar/${item.id}`,
    });
  });

  stockOpnameData.forEach((item: any) => {
    results.push({
      id: `STOCK_OPNAME-${item.id}`,
      originalId: item.id,
      tipe: "STOCK_OPNAME",
      nomor: item.nomor,
      tanggal: new Date(item.tanggal),
      keterangan: item.keterangan || "-",
      status: item.status,
      link: `/dashboard/stock-opname/${item.id}`,
    });
  });

  results.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

  return results;
}

export async function fetchArsipStats() {
  const [spbCount, sppbCount, bastMasukCount, bastKeluarCount] =
    await Promise.all([
      db.select({ total: count() }).from(spb),
      db.select({ total: count() }).from(sppb),
      db.select({ total: count() }).from(bastMasuk),
      db.select({ total: count() }).from(bastKeluar),
    ]);

  const spbTotal = spbCount[0]?.total ?? 0;
  const sppbTotal = sppbCount[0]?.total ?? 0;
  const bastTotal =
    (bastMasukCount[0]?.total ?? 0) + (bastKeluarCount[0]?.total ?? 0);

  return {
    spbTotal,
    sppbTotal,
    bastTotal,
  };
}
