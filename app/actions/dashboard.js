'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { unstable_cache } from 'next/cache';

// Error Types
const ErrorTypes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};

// Core stats fetcher
async function fetchDashboardStats() {
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
    prisma.barang.count({
      where: { isActive: true }
    }),
    prisma.spb.count({
      where: {
        sppbList: { none: {} }
      }
    }),
    prisma.$queryRaw`SELECT COUNT(*)::int FROM barang WHERE stok_tersedia <= stok_minimum AND is_active = true`
      .then(res => Number(res[0]?.count || 0)),
    prisma.bastMasuk.count({
      where: {
        tanggalBast: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }),
    prisma.sppb.count()
  ]);

  return {
    totalBarang,
    permintaanBaru,
    stokKritis,
    bastMasukBulanIni,
    totalSppb
  };
}

// Core recent documents fetcher
async function fetchRecentDocuments() {
  const [recentSpb, recentSppb] = await Promise.all([
    prisma.spb.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { pemohon: true }
    }),
    prisma.sppb.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { penerima: true }
    })
  ]);

  return {
    recentSpb: recentSpb.map(item => ({
      id: item.id,
      type: 'SPB',
      number: item.nomorSpb,
      date: item.tanggalSpb,
      actor: item.pemohon?.nama,
      status: 'Menunggu'
    })),
    recentSppb: recentSppb.map(item => ({
      id: item.id,
      type: 'SPPB',
      number: item.nomorSppb,
      date: item.tanggalSppb,
      actor: item.penerima?.nama,
      status: 'Selesai'
    }))
  };
}

// Core chart data fetcher
async function fetchChartData(range) {
  const now = new Date();
  let startDate = new Date();
  let groupBy = 'month';

  if (range === '6m') {
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    groupBy = 'month';
  } else if (range === '30d') {
    startDate.setDate(startDate.getDate() - 29);
    groupBy = 'day';
  } else if (range === '7d') {
    startDate.setDate(startDate.getDate() - 6);
    groupBy = 'day';
  }
  startDate.setHours(0, 0, 0, 0);

  const [bastMasuk, bastKeluar] = await Promise.all([
    prisma.bastMasuk.findMany({
      where: { tanggalBast: { gte: startDate } },
      select: { tanggalBast: true }
    }),
    prisma.sppb.findMany({
      where: { tanggalSppb: { gte: startDate } },
      select: { tanggalSppb: true }
    })
  ]);

  const groupedData = {};

  if (groupBy === 'month') {
    for (let i = 0; i < 6; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const key = d.toLocaleDateString('id-ID', { month: 'short' });
      groupedData[key] = { name: key, Masuk: 0, Keluar: 0 };
    }
  } else {
    const daysCount = range === '7d' ? 7 : 30;
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      groupedData[key] = { name: key, Masuk: 0, Keluar: 0 };
    }
  }

  const formatKey = (dateStr) => {
    const d = new Date(dateStr);
    if (groupBy === 'month') {
      return d.toLocaleDateString('id-ID', { month: 'short' });
    } else {
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  };

  bastMasuk.forEach(item => {
    const key = formatKey(item.tanggalBast);
    if (groupedData[key]) groupedData[key].Masuk++;
  });

  bastKeluar.forEach(item => {
    const key = formatKey(item.tanggalSppb);
    if (groupedData[key]) groupedData[key].Keluar++;
  });

  return Object.values(groupedData);
}

// Cached versions
const getCachedStats = unstable_cache(
  fetchDashboardStats,
  ['dashboard-stats'],
  { revalidate: 60, tags: ['dashboard'] }
);

const getCachedRecentDocs = unstable_cache(
  fetchRecentDocuments,
  ['dashboard-recent-docs'],
  { revalidate: 30, tags: ['dashboard'] }
);

const getCachedChartData = unstable_cache(
  fetchChartData,
  ['dashboard-chart'],
  { revalidate: 60, tags: ['dashboard'] }
);

// Exported functions
export async function getDashboardStats() {
  const session = await auth();
  if (!session) {
    return {
      error: ErrorTypes.UNAUTHORIZED,
      message: 'Anda harus login untuk mengakses data ini'
    };
  }

  try {
    return await getCachedStats();
  } catch (error) {
    console.error('Dashboard Stats Error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return {
      error: ErrorTypes.DATABASE_ERROR,
      message: 'Gagal mengambil statistik dashboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

export async function getRecentDocuments() {
  const session = await auth();
  if (!session) {
    return {
      error: ErrorTypes.UNAUTHORIZED,
      message: 'Anda harus login untuk mengakses data ini'
    };
  }

  try {
    return await getCachedRecentDocs();
  } catch (error) {
    console.error('Recent Docs Error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return {
      error: ErrorTypes.DATABASE_ERROR,
      message: 'Gagal mengambil dokumen terbaru',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      recentSpb: [],
      recentSppb: []
    };
  }
}

export async function getDashboardChartData(range = '6m') {
  const session = await auth();
  if (!session) {
    return {
      error: ErrorTypes.UNAUTHORIZED,
      message: 'Anda harus login untuk mengakses data ini',
      data: []
    };
  }

  const validRanges = ['7d', '30d', '6m'];
  if (!validRanges.includes(range)) {
    return {
      error: ErrorTypes.VALIDATION_ERROR,
      message: `Range tidak valid. Pilih salah satu: ${validRanges.join(', ')}`,
      data: []
    };
  }

  try {
    const data = await getCachedChartData(range);
    return { data };
  } catch (error) {
    console.error('Chart Data Error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return {
      error: ErrorTypes.DATABASE_ERROR,
      message: 'Gagal mengambil data chart',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      data: []
    };
  }
}

// Revalidate cache function
export async function revalidateDashboardCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('dashboard');
}
