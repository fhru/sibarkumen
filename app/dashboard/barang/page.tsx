import { Suspense } from 'react';
import { getBarangList, getBarangStats } from '@/drizzle/data/barang';
import { BarangTable } from './components/barang-table';
import { BarangStats } from './components/barang-stats';
import { db } from '@/lib/db';
import { kategori, satuan } from '@/drizzle/schema';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { BarangDialogCreate } from './components/barang-dialog-create';

export const metadata = {
  title: 'Barang | Sibarkumen',
  description: 'Kelola daftar barang di sini.',
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
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Data Barang</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Barang</h2>
          <p className="text-muted-foreground">Kelola daftar barang di sini.</p>
        </div>
        <BarangDialogCreate
          kategoriList={kategoriList}
          satuanList={satuanList}
        />
      </div>

      {/* 3. Stats */}
      <BarangStats
        totalItems={stats.totalItems}
        lowStockCount={stats.lowStockCount}
        topCategory={stats.topCategory}
      />

      <div className="flex h-full flex-1 flex-col space-y-6">
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
