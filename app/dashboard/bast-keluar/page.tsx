import {
  getBastKeluarList,
  getBastKeluarStats,
} from '@/drizzle/actions/bast-keluar';
import { BastKeluarTable } from './components/bast-keluar-table';
import { BastKeluarStats } from './components/bast-keluar-stats';
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
import { getSession } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';

export const metadata = {
  title: 'BAST Keluar | Sibarkumen',
  description: 'Kelola berita acara serah terima barang keluar',
};

export default async function BastKeluarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 50;
  const search = (params.search as string) || '';
  const sortBy = (params.sortBy as string) || undefined;
  const sortOrder = (params.sortOrder as 'asc' | 'desc') || undefined;
  const startDate = (params.startDate as string) || undefined;
  const endDate = (params.endDate as string) || undefined;
  const isPrinted =
    params.isPrinted === 'true'
      ? true
      : params.isPrinted === 'false'
        ? false
        : undefined;

  const [{ data, pagination }, stats, session] = await Promise.all([
    getBastKeluarList({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      isPrinted,
      startDate,
      endDate,
    }),
    getBastKeluarStats(),
    getSession(),
  ]);

  const userRole = (session?.user.role as Role) || 'petugas';

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>BAST Keluar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Berita Acara Serah Terima (BAST) Keluar
          </h2>
          <p className="text-muted-foreground">
            Kelola Berita Acara Serah Terima Barang Keluar
          </p>
        </div>
        {userRole !== 'supervisor' && (
          <Link href="/dashboard/bast-keluar/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat BAST Keluar
            </Button>
          </Link>
        )}
      </div>

      <BastKeluarStats stats={stats} />

      <div className="flex h-full flex-1 flex-col space-y-4">
        <BastKeluarTable data={data} pagination={pagination} />
      </div>
    </div>
  );
}
