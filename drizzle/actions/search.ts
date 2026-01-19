'use server';

import { db } from '@/lib/db';
import { barang, pegawai, pihakKetiga } from '@/drizzle/schema';
import { or, ilike } from 'drizzle-orm';

export async function searchBarang(query: string, limit = 20) {
  if (!query || query.length < 2) {
    // Return first 20 items if no query
    const results = await db
      .select({
        id: barang.id,
        nama: barang.nama,
        kodeBarang: barang.kodeBarang,
      })
      .from(barang)
      .limit(limit);

    return results;
  }

  const results = await db
    .select({
      id: barang.id,
      nama: barang.nama,
      kodeBarang: barang.kodeBarang,
    })
    .from(barang)
    .where(
      or(
        ilike(barang.nama, `%${query}%`),
        ilike(barang.kodeBarang, `%${query}%`)
      )
    )
    .limit(limit);

  return results;
}

export async function searchPegawai(query: string, limit = 20) {
  if (!query || query.length < 2) {
    const results = await db
      .select({
        id: pegawai.id,
        nama: pegawai.nama,
        nip: pegawai.nip,
      })
      .from(pegawai)
      .limit(limit);

    return results;
  }

  const results = await db
    .select({
      id: pegawai.id,
      nama: pegawai.nama,
      nip: pegawai.nip,
    })
    .from(pegawai)
    .where(
      or(ilike(pegawai.nama, `%${query}%`), ilike(pegawai.nip, `%${query}%`))
    )
    .limit(limit);

  return results;
}

export async function searchPihakKetiga(query: string, limit = 20) {
  if (!query || query.length < 2) {
    const results = await db
      .select({
        id: pihakKetiga.id,
        nama: pihakKetiga.nama,
      })
      .from(pihakKetiga)
      .limit(limit);

    return results;
  }

  const results = await db
    .select({
      id: pihakKetiga.id,
      nama: pihakKetiga.nama,
    })
    .from(pihakKetiga)
    .where(ilike(pihakKetiga.nama, `%${query}%`))
    .limit(limit);

  return results;
}
