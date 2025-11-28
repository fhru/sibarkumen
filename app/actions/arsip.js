'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function getArsipList({ page = 1, limit = 20, query = '', type = 'ALL' }) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  // Since we need to merge 4 tables, implementing strict database-level pagination is hard with Prisma.
  // For MVP/V3, we will fetch a reasonable amount of recent items from ALL tables matching the query,
  // merge them, sort them, and then slice for pagination. 
  // Note: This is not scalable for millions of records, but fine for a Kelurahan inventory system.

  const skip = (page - 1) * limit;
  
  // Common filter for "Number" or "Date" or "Related Person Name"
  const commonWhere = (fieldNum, fieldPerson) => ({
    OR: [
       { [fieldNum]: { contains: query, mode: 'insensitive' } },
       // If query matches a person name, we need relation check
       // This gets complex for generic search. Let's stick to Document Number search for now.
    ]
  });

  // If query is present, we filter.
  
  try {
    const fetchPromises = [];

    // 1. BAST Masuk
    if (type === 'ALL' || type === 'BAST_MASUK') {
        fetchPromises.push(
            prisma.bastMasuk.findMany({
                where: { nomorBast: { contains: query, mode: 'insensitive' } },
                take: 50,
                orderBy: { tanggalBast: 'desc' },
                include: { pptkPpk: true }
            }).then(res => res.map(item => ({
                id: item.id,
                type: 'BAST_MASUK',
                number: item.nomorBast,
                date: item.tanggalBast,
                actor: item.pptkPpk?.nama,
                description: item.asalPembelian
            })))
        );
    }

    // 2. SPB
    if (type === 'ALL' || type === 'SPB') {
        fetchPromises.push(
            prisma.spb.findMany({
                where: { nomorSpb: { contains: query, mode: 'insensitive' } },
                take: 50,
                orderBy: { tanggalSpb: 'desc' },
                include: { pemohon: true }
            }).then(res => res.map(item => ({
                id: item.id,
                type: 'SPB',
                number: item.nomorSpb,
                date: item.tanggalSpb,
                actor: item.pemohon?.nama,
                description: item.keterangan
            })))
        );
    }

    // 3. SPPB
    if (type === 'ALL' || type === 'SPPB') {
        fetchPromises.push(
            prisma.sppb.findMany({
                where: { nomorSppb: { contains: query, mode: 'insensitive' } },
                take: 50,
                orderBy: { tanggalSppb: 'desc' },
                include: { penerima: true }
            }).then(res => res.map(item => ({
                id: item.id,
                type: 'SPPB',
                number: item.nomorSppb,
                date: item.tanggalSppb,
                actor: item.penerima?.nama,
                description: item.keterangan
            })))
        );
    }

    // 4. BAST Keluar
    if (type === 'ALL' || type === 'BAST_KELUAR') {
        fetchPromises.push(
            prisma.bastKeluar.findMany({
                where: { nomorBast: { contains: query, mode: 'insensitive' } },
                take: 50,
                orderBy: { tanggalBast: 'desc' },
                include: { pihakMenerima: true }
            }).then(res => res.map(item => ({
                id: item.id,
                type: 'BAST_KELUAR',
                number: item.nomorBast,
                date: item.tanggalBast,
                actor: item.pihakMenerima?.nama,
                description: item.keterangan
            })))
        );
    }

    const results = await Promise.all(fetchPromises);
    let combined = results.flat();

    // Sort by Date Desc
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = combined.length;
    const pagedData = combined.slice(skip, skip + limit);

    return {
      data: pagedData,
      metadata: {
        hasNextPage: skip + limit < total,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };

  } catch (error) {
    console.error('Fetch Arsip Error:', error);
    return { error: 'Failed to fetch Arsip' };
  }
}
