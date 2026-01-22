'use server';

import { db } from '@/lib/db';
import {
  barang,
  pegawai,
  pihakKetiga,
  satuan,
  pegawaiJabatan,
  jabatan,
} from '@/drizzle/schema';
import { or, ilike, eq, and } from 'drizzle-orm';

export async function searchBarang(query: string, limit = 20) {
  if (!query || query.length < 2) {
    // Return first 20 items if no query
    const results = await db
      .select({
        id: barang.id,
        nama: barang.nama,
        kodeBarang: barang.kodeBarang,
        stok: barang.stok,
        satuanId: barang.satuanId,
        satuanNama: satuan.nama,
      })
      .from(barang)
      .leftJoin(satuan, eq(barang.satuanId, satuan.id))
      .limit(limit);

    return results;
  }

  const results = await db
    .select({
      id: barang.id,
      nama: barang.nama,
      kodeBarang: barang.kodeBarang,
      stok: barang.stok,
      satuanId: barang.satuanId,
      satuanNama: satuan.nama,
    })
    .from(barang)
    .leftJoin(satuan, eq(barang.satuanId, satuan.id))
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
        jabatan: jabatan.nama,
      })
      .from(pegawai)
      .leftJoin(
        pegawaiJabatan,
        and(
          eq(pegawaiJabatan.pegawaiId, pegawai.id),
          eq(pegawaiJabatan.isAktif, true)
        )
      )
      .leftJoin(jabatan, eq(pegawaiJabatan.jabatanId, jabatan.id))
      .limit(limit);

    return results;
  }

  const results = await db
    .select({
      id: pegawai.id,
      nama: pegawai.nama,
      nip: pegawai.nip,
      jabatan: jabatan.nama,
    })
    .from(pegawai)
    .leftJoin(
      pegawaiJabatan,
      and(
        eq(pegawaiJabatan.pegawaiId, pegawai.id),
        eq(pegawaiJabatan.isAktif, true)
      )
    )
    .leftJoin(jabatan, eq(pegawaiJabatan.jabatanId, jabatan.id))
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
