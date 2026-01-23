import { getSPPBList, getSPPBStats } from '@/drizzle/actions/sppb';
import { getSession } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';
import { SPPBTable } from './components/sppb-table';
import { SPPBStats } from './components/sppb-stats';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'SPPB | Sibarkumen',
  description: 'Kelola surat perintah pengeluaran barang',
};

export default async function SPPBPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 50;
  const search = (params.search as string) || '';
  const sortBy = (params.sortBy as string) || 'nomorSppb';
  const sortOrder = (params.sortOrder as 'asc' | 'desc') || 'desc';
  const startDate = (params.startDate as string) || undefined;
  const endDate = (params.endDate as string) || undefined;
  const status = params.status as
    | 'MENUNGGU_BAST'
    | 'SELESAI'
    | 'BATAL'
    | undefined;
  const isPrinted =
    params.isPrinted === 'true'
      ? true
      : params.isPrinted === 'false'
        ? false
        : undefined;

  const [{ data, pagination }, stats] = await Promise.all([
    getSPPBList({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
      isPrinted,
      startDate,
      endDate,
    }),
    getSPPBStats(),
  ]);

  const session = await getSession();
  const role = (session?.user.role as Role) || 'petugas';

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>SPPB</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Surat Perintah Penyaluran Barang (SPPB)
          </h2>
          <p className="text-muted-foreground">
            Kelola surat perintah Penyaluran barang
          </p>
        </div>
        {role !== 'supervisor' && role !== 'petugas' && (
          <Link href="/dashboard/sppb/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat SPPB
            </Button>
          </Link>
        )}
      </div>

      <SPPBStats stats={stats} />

      <div className="flex h-full flex-1 flex-col space-y-4">
        <SPPBTable
          data={data}
          pageCount={pagination.totalPages}
          totalItems={pagination.total}
        />
      </div>
    </div>
  );
}
