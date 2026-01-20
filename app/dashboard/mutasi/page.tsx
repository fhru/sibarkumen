import {
  getMutasiBarangStats,
  getMutasiBarangList,
} from '@/drizzle/data/mutasi-barang';
import { MutasiBarangStats } from './components/mutasi-barang-stats';
import { MutasiBarangTable } from './components/mutasi-barang-table';

export const metadata = {
  title: 'Mutasi Barang',
  description: 'Riwayat pergerakan stok barang',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    jenisMutasi?: 'MASUK' | 'KELUAR' | 'PENYESUAIAN';
    startDate?: string;
    endDate?: string;
    sumberTransaksi?: string;
  }>;
}

export default async function MutasiPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || undefined;
  const sortBy = params.sortBy || undefined;
  const sortOrder = params.sortOrder || undefined;
  const jenisMutasi = params.jenisMutasi || undefined;
  const startDate = params.startDate || undefined;
  const endDate = params.endDate || undefined;
  const sumberTransaksi = params.sumberTransaksi || undefined;

  const [stats, result] = await Promise.all([
    getMutasiBarangStats(),
    getMutasiBarangList({
      page,
      search,
      sortBy,
      sortOrder,
      jenisMutasi,
      startDate,
      endDate,
      sumberTransaksi,
    }),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mutasi Barang</h2>
          <p className="text-muted-foreground">
            Riwayat pergerakan stok barang masuk, keluar, dan penyesuaian
          </p>
        </div>
      </div>

      <MutasiBarangStats
        totalQtyMasuk={stats.totalQtyMasuk}
        totalQtyKeluar={stats.totalQtyKeluar}
        totalPenyesuaian={stats.totalPenyesuaian}
        totalTransaksi={stats.totalTransaksi}
      />

      <div className="space-y-4">
        <MutasiBarangTable
          data={result.data}
          pageCount={result.meta.pageCount}
          totalItems={result.meta.total}
        />
      </div>
    </div>
  );
}
