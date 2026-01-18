import { Suspense } from 'react';
import { getBarangList, getBarangStats } from '@/drizzle/data/barang';
import { BarangTable } from './components/barang-table';
import { BarangStats } from './components/barang-stats';
import { db } from '@/lib/db';
import { kategori, satuan } from '@/drizzle/schema';

export const metadata = {
  title: 'Dashboard Barang',
  description: 'Manajemen Data Barang',
};

export default async function BarangPage(props: {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    sort?: string;
    order?: string;
    categories?: string;
    status?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const page = Number(searchParams?.page) || 1;
  const sort = searchParams?.sort || 'updatedAt';
  const order = (searchParams?.order as 'asc' | 'desc') || 'desc';
  const categories = searchParams?.categories
    ? searchParams.categories.split(',').map(Number)
    : undefined;
  const status = searchParams?.status;
  const limit = 50;

  const [dataPayload, stats, kategoriList, satuanList] = await Promise.all([
    getBarangList(page, limit, search, sort, order, categories, status),
    getBarangStats(),
    db.select({ id: kategori.id, nama: kategori.nama }).from(kategori),
    db.select({ id: satuan.id, nama: satuan.nama }).from(satuan),
  ]);

  const { data, meta } = dataPayload;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Data Barang</h2>
      </div>

      <BarangStats
        totalItems={stats.totalItems}
        lowStockCount={stats.lowStockCount}
        topCategory={stats.topCategory}
      />

      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <Suspense fallback={<div>Loading table...</div>}>
          <BarangTable
            data={data}
            pageCount={meta.pageCount}
            kategoriList={kategoriList}
            satuanList={satuanList}
            totalItems={meta.total}
          />
        </Suspense>
      </div>
    </div>
  );
}
