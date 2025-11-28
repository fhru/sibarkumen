'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { unstable_cache } from 'next/cache';

// Cached version of the stats fetcher
const getCachedStats = unstable_cache(
  async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalBarang,
      permintaanBaru,
      stokKritis,
      bastMasukBulanIni,
      totalSppb
    ] = await Promise.all([
      // 1. Total Barang (Active)
      prisma.barang.count({
        where: { isActive: true }
      }),

      // 2. Permintaan Baru (SPB that has NO linked SPPB)
      prisma.spb.count({
        where: {
          sppbList: {
            none: {}
          }
        }
      }),

      // 3. Stok Kritis (Active barang where stokTersedia <= stokMinimum)
      prisma.$queryRaw`SELECT COUNT(*)::int FROM barang WHERE stok_tersedia <= stok_minimum AND is_active = true`
        .then(res => Number(res[0]?.count || 0)),

      // 4. BAST Masuk Month
      prisma.bastMasuk.count({
        where: {
          tanggalBast: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),

      // 5. Total Barang Keluar (SPPB count)
      prisma.sppb.count()
    ]);

    return {
      totalBarang,
      permintaanBaru,
      stokKritis,
      bastMasukBulanIni,
      totalSppb
    };
  },
  ['dashboard-stats'], // Cache Key
  { revalidate: 60 }   // Revalidate every 60 seconds
);

export async function getDashboardStats() {
  const session = await auth();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    return await getCachedStats();
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return { error: 'Failed to fetch dashboard stats' };
  }
}

export async function getRecentDocuments() {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };

    try {
        // Fetch recent SPB
        const recentSpb = await prisma.spb.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { pemohon: true }
        });

        // Fetch recent SPPB
        const recentSppb = await prisma.sppb.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { penerima: true }
        });

        return {
            recentSpb: recentSpb.map(item => ({
                id: item.id,
                type: 'SPB',
                number: item.nomorSpb,
                date: item.tanggalSpb,
                actor: item.pemohon.nama,
                status: 'Menunggu' // Logic needed if we want real status
            })),
            recentSppb: recentSppb.map(item => ({
                id: item.id,
                type: 'SPPB',
                number: item.nomorSppb,
                date: item.tanggalSppb,
                actor: item.penerima.nama,
                status: 'Selesai'
            }))
        };
    } catch (error) {
        console.error('Recent Docs Error:', error);
        return { recentSpb: [], recentSppb: [] };
    }
}
