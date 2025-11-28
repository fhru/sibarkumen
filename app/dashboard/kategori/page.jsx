import { getKategoriList } from '@/app/actions/kategori';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { columns } from '@/components/kategori/columns';
import { KategoriDialog } from '@/components/kategori/kategori-dialog';

export default async function KategoriPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session) redirect('/login');

  const page = Number(searchParams?.page) || 1;
  const query = searchParams?.query || '';

  const { data, metadata } = await getKategoriList({ page, limit: 10, query });

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kategori Barang</h1>
        <KategoriDialog />
      </div>

      <div className="flex items-center space-x-2">
        <SearchInput placeholder="Cari kategori..." />
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
