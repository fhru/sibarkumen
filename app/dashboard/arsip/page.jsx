import { Suspense } from 'react';
import { getArsipList } from '@/app/actions/arsip';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { columns } from '@/components/arsip/columns';
import { TableSkeleton } from '@/components/ui/table-skeleton';

async function ArsipTable({ page, query, type }) {
  const { data, metadata, error } = await getArsipList({ page, limit: 20, query, type });
  
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

export default async function ArsipPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session) redirect('/login');

  const page = Number(searchParams?.page) || 1;
  const query = searchParams?.query || '';
  const type = searchParams?.type || 'ALL';

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Arsip Dokumen</h1>
      </div>

      <div className="flex items-center space-x-2">
        <SearchInput placeholder="Cari Nomor Dokumen atau Nama..." />
      </div>

      <Suspense fallback={<TableSkeleton rows={10} columns={5} />}>
        <ArsipTable page={page} query={query} type={type} />
      </Suspense>
    </div>
  );
}
