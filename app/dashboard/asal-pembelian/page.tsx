import { db } from '@/lib/db';
import { asalPembelian } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { AsalPembelianTable } from './components/asal-pembelian-table';
import { AsalPembelianStats } from './components/asal-pembelian-stats';

export const dynamic = 'force-dynamic';

export default async function AsalPembelianPage() {
  const data = await db
    .select()
    .from(asalPembelian)
    .orderBy(desc(asalPembelian.id));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asal Pembelian</h2>
          <p className="text-muted-foreground">
            Kelola daftar asal pembelian (vendor/toko) di sini.
          </p>
        </div>
      </div>
      <AsalPembelianStats totalAsalPembelian={data.length} />
      <AsalPembelianTable data={data} />
    </div>
  );
}
