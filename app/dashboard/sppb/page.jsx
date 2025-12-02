import { Suspense } from 'react';
import { getSppbList } from '@/app/actions/sppb';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { columns } from '@/components/sppb/columns';
import { TableSkeleton } from '@/components/ui/table-skeleton';

async function SppbTable({ page, query }) {
  const { data, metadata, error } = await getSppbList({ page, limit: 10, query });
  
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

export default async function SppbPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session) redirect('/login');
  
  const page = Number(searchParams?.page) || 1;
  const query = searchParams?.query || '';

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daftar Penyaluran (SPPB)</h1>
        <Link href="/dashboard/sppb/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat SPPB Baru
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <SearchInput placeholder="Cari No SPPB atau SPB..." />
      </div>

      <Suspense fallback={<TableSkeleton rows={10} columns={5} />}>
        <SppbTable page={page} query={query} />
      </Suspense>
    </div>
  );
}
