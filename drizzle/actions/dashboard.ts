'use server';

import {
  getDashboardChartData as getChartData,
  getLowStockItems as getLowStock,
  getDashboardStats,
  getFastMovingItems,
  getDeadStockItems,
  getCategoryDistribution,
} from '@/drizzle/data/dashboard';
import { getMutasiBarangList } from '@/drizzle/data/mutasi-barang';

export async function fetchDashboardStats() {
  return await getDashboardStats();
}

export async function fetchFastMovingItems() {
  return await getFastMovingItems();
}

export async function fetchDeadStockItems() {
  return await getDeadStockItems();
}

export async function fetchCategoryDistribution() {
  return await getCategoryDistribution();
}

export async function fetchDashboardChartData(
  range: 'day' | 'week' | 'month' | 'year'
) {
  return await getChartData(range);
}

export async function fetchLowStockItems() {
  return await getLowStock();
}

export async function fetchRecentActivity() {
  // limit 5
  const result = await getMutasiBarangList({ limit: 5, sortOrder: 'desc' });
  return result.data;
}
