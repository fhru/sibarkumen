import { Suspense } from 'react';
import { getBastMasukList, getBastMasukStats } from '@/drizzle/data/bast-masuk';
import { BastMasukTable } from './components/bast-masuk-table';
import { BastMasukStats } from './components/bast-masuk-stats';

export const metadata = {
  title: 'BAST Masuk | Dashboard',
  description: 'Kelola Berita Acara Serah Terima Masuk',
};

export default async function BastMasukPage() {
  const [data, stats] = await Promise.all([
    getBastMasukList(),
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
          <BastMasukTable data={data} />
        </Suspense>
      </div>
    </div>
  );
}
