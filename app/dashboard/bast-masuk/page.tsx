import { Suspense } from 'react';
import { getBastMasukList, getBastMasukStats } from '@/drizzle/data/bast-masuk';
import { BastMasukTable } from './components/bast-masuk-table';
import { BastMasukStats } from './components/bast-masuk-stats';

export const metadata = {
  title: 'BAST Masuk | Dashboard',
  description: 'Kelola Berita Acara Serah Terima Masuk',
};

interface PageProps {
  searchParams: {
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
  };
}

export default async function BastMasukPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search;
  const sortBy = params.sortBy || 'tanggalBast';
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">BAST Masuk</h2>
          <p className="text-muted-foreground">
            Daftar penerimaan barang (Berita Acara Serah Terima).
          </p>
        </div>
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
