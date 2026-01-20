'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  getMutasiBarangStats,
  getMutasiBarangList,
  getMutasiBarangById,
} from '@/drizzle/data/mutasi-barang';

// Helper to check authentication
async function checkAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getMutasiBarang(filters?: {
  barangId?: number;
  jenisMutasi?: 'MASUK' | 'KELUAR' | 'PENYESUAIAN';
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    await checkAuth();

    // Convert Date to string for getMutasiBarangList
    const params = {
      barangId: filters?.barangId,
      jenisMutasi: filters?.jenisMutasi,
      startDate: filters?.startDate?.toISOString().split('T')[0],
      endDate: filters?.endDate?.toISOString().split('T')[0],
    };

    const result = await getMutasiBarangList(params);
    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal mengambil data mutasi',
      data: [],
    };
  }
}

export async function getMutasiBarangDetail(id: number) {
  try {
    await checkAuth();
    const data = await getMutasiBarangById(id);
    if (!data) {
      return { success: false, message: 'Data tidak ditemukan' };
    }
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal mengambil detail mutasi',
    };
  }
}

export async function getStatsMutasiBarang() {
  try {
    await checkAuth();
    const stats = await getMutasiBarangStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal mengambil statistik',
    };
  }
}
