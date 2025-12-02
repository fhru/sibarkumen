import { Suspense } from 'react';
import { getBarangList } from '@/app/actions/barang';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { columns } from '@/components/barang/columns';
import { AddBarangDialog } from '@/components/barang/add-barang-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';

async function BarangTable({ page, query }) {
  const { data, metadata, error } = await getBarangList({ page, limit: 10, query });
  
  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error.message || 'Gagal memuat data'}</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data || []}
      pagination={{
        currentPage: page,
        totalPages: metadata?.totalPages || 1,
        hasNextPage: metadata?.hasNextPage,
      }}
    />
  );
}

export default async function BarangPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session) redirect('/login');

  const page = Number(searchParams?.page) || 1;
  const query = searchParams?.query || '';

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daftar Barang</h1>
        <AddBarangDialog />
      </div>

      <div className="flex items-center space-x-2">
        <SearchInput placeholder="Cari nama, kode, atau kategori..." />
      </div>

      <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
        <BarangTable page={page} query={query} />
      </Suspense>
    </div>
  );
}
