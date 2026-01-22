import { Suspense } from 'react';
import { getBastMasukList, getBastMasukStats } from '@/drizzle/data/bast-masuk';
import { BastMasukTable } from './components/bast-masuk-table';
import { BastMasukStats } from './components/bast-masuk-stats';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'BAST Masuk | Sibarkumen',
  description: 'Kelola Berita Acara Serah Terima Masuk',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    pihakKetiga?: string;
    pptk?: string;
    asalPembelian?: string;
    rekening?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function BastMasukPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search;
  const sortBy = params.sortBy || 'nomorReferensi';
  const sortOrder = (params.sortOrder as 'asc' | 'desc') || 'desc';
  const pihakKetigaId = params.pihakKetiga
    ? Number(params.pihakKetiga)
    : undefined;
  const pptkPpkId = params.pptk ? Number(params.pptk) : undefined;
  const asalPembelianId = params.asalPembelian
    ? Number(params.asalPembelian)
    : undefined;
  const rekeningId = params.rekening ? Number(params.rekening) : undefined;
  const startDate = params.startDate ? new Date(params.startDate) : undefined;
  const endDate = params.endDate ? new Date(params.endDate) : undefined;

  const [result, stats] = await Promise.all([
    getBastMasukList(
      page,
      50,
      search,
      sortBy,
      sortOrder,
      pihakKetigaId,
      pptkPpkId,
      asalPembelianId,
      rekeningId,
      startDate,
      endDate
    ),
    getBastMasukStats(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>BAST Masuk</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">BAST Masuk</h2>
          <p className="text-muted-foreground">
            Daftar penerimaan barang (Berita Acara Serah Terima).
          </p>
        </div>
        <Link href="/dashboard/bast-masuk/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat BAST Masuk
          </Button>
        </Link>
      </div>

      <BastMasukStats
        totalBast={stats.totalBast}
        totalNilaiTransaksi={stats.totalNilaiTransaksi}
        supplierTerbanyak={stats.supplierTerbanyak}
      />

      <div className="flex h-full flex-1 flex-col space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <BastMasukTable
            data={result.data}
            pageCount={result.meta.pageCount}
            totalItems={result.meta.total}
          />
        </Suspense>
      </div>
    </div>
  );
}
