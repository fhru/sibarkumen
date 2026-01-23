import { getSPBStats, getSPBList } from '@/drizzle/data/spb';
import { getSession } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';
import { SPBStats } from './components/spb-stats';
import { SPBTable } from './components/spb-table';
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
  title: 'SPB | Sibarkumen',
  description: 'Kelola surat permintaan barang',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'MENUNGGU_SPPB' | 'SELESAI' | 'BATAL';
    isPrinted?: string; // Search params are strings
    startDate?: string;
    endDate?: string;
    pemohonId?: string;
  }>;
}

export default async function SPBPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || undefined;
  const sortBy = params.sortBy || undefined;
  const sortOrder = params.sortOrder || undefined;
  const status = params.status as
    | 'MENUNGGU_SPPB'
    | 'SELESAI'
    | 'BATAL'
    | undefined;
  const isPrinted =
    params.isPrinted === 'true'
      ? true
      : params.isPrinted === 'false'
        ? false
        : undefined;
  const startDate = params.startDate || undefined;
  const endDate = params.endDate || undefined;
  const pemohonId = params.pemohonId ? parseInt(params.pemohonId) : undefined;

  const [stats, result] = await Promise.all([
    getSPBStats(),
    getSPBList({
      page,
      search,
      sortBy,
      sortOrder,
      status,
      isPrinted,
      startDate,
      endDate,
      pemohonId,
    }),
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
            <BreadcrumbPage>SPB</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Surat Permintaan Barang (SPB)
          </h2>
          <p className="text-muted-foreground">
            Kelola permintaan barang dari unit kerja
          </p>
        </div>
        {role !== 'supervisor' && (
          <Link href="/dashboard/spb/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat SPB
            </Button>
          </Link>
        )}
      </div>

      <SPBStats
        total={stats.total}
        menungguSppb={stats.menungguSppb}
        selesai={stats.selesai}
      />

      <div className="flex h-full flex-1 flex-col space-y-4">
        <SPBTable
          data={result.data}
          pageCount={result.meta.pageCount}
          totalItems={result.meta.total}
        />
      </div>
    </div>
  );
}
