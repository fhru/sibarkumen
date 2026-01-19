import { db } from '@/lib/db';
import { pihakKetiga } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { PihakKetigaTable } from './components/pihak-ketiga-table';
import { PihakKetigaStats } from './components/pihak-ketiga-stats';

export const dynamic = 'force-dynamic';

export default async function PihakKetigaPage() {
  const data = await db
    .select()
    .from(pihakKetiga)
    .orderBy(desc(pihakKetiga.id));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pihak Ketiga</h2>
          <p className="text-muted-foreground">
            Kelola daftar pihak ketiga (supplier/rekanan) di sini.
          </p>
        </div>
      </div>
      <PihakKetigaStats totalPihakKetiga={data.length} />
      <PihakKetigaTable data={data} />
    </div>
  );
}
