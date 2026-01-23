import {
  fetchStockOpnameSessions,
  fetchPegawaiList,
} from '@/drizzle/actions/stock-opname';
import { getSession } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';
import { CreateStockOpnameDialog } from '@/app/dashboard/stock-opname/components/create-stock-opname-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Suspense } from 'react';
import { StockOpnameTable } from './components/stock-opname-table';

export default async function StockOpnamePage(props: {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    status?: string;
    petugas?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const page = Number(searchParams?.page) || 1;
  const status = searchParams?.status;
  const petugasId = searchParams?.petugas
    ? Number(searchParams.petugas)
    : undefined;
  const limit = 10;

  const [sessionsResult, pegawaiResult, session] = await Promise.all([
    fetchStockOpnameSessions(page, limit, search, status, petugasId),
    fetchPegawaiList(),
    getSession(),
  ]);

  const userRole = (session?.user.role as Role) || 'petugas';

  const sessions = sessionsResult.data || [];
  const meta = sessionsResult.meta || { pageCount: 0, total: 0 };
  const pegawaiList = pegawaiResult.data || [];

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
            <BreadcrumbLink href="/dashboard/transaksi-masuk">
              Inventaris
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Stock Opname</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stock Opname</h2>
          <p className="text-muted-foreground">
            Kelola sesi stock opname dan penyesuaian stok.
          </p>
        </div>
        {userRole !== 'supervisor' && (
          <CreateStockOpnameDialog pegawaiList={pegawaiList} />
        )}
      </div>

      {/* 3. Content */}
      <div className="flex h-full flex-1 flex-col space-y-6">
        <Suspense fallback={<div>Loading table...</div>}>
          <StockOpnameTable
            data={sessions}
            pageCount={meta.pageCount}
            totalItems={meta.total}
            petugasList={pegawaiList}
          />
        </Suspense>
      </div>
    </div>
  );
}
