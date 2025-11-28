import { getSppbList } from '@/app/actions/sppb';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { columns } from '@/components/sppb/columns';

export default async function SppbPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session) redirect('/login');
  
  const page = Number(searchParams?.page) || 1;
  const query = searchParams?.query || '';

  const { data, metadata } = await getSppbList({ page, limit: 10, query });

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

      <DataTable
        columns={columns}
        data={data || []}
        pagination={{
          currentPage: page,
          totalPages: metadata?.totalPages || 1,
          hasNextPage: metadata?.hasNextPage,
        }}
      />
    </div>
  );
}
