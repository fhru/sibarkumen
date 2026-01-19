import { db } from '@/lib/db';
import { rekening } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { RekeningTable } from './components/rekening-table';
import { RekeningStats } from './components/rekening-stats';

export const dynamic = 'force-dynamic';

export default async function RekeningPage() {
  const data = await db.select().from(rekening).orderBy(desc(rekening.id));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rekening</h2>
          <p className="text-muted-foreground">
            Kelola daftar rekening bank di sini.
          </p>
        </div>
      </div>
      <RekeningStats totalRekening={data.length} />
      <RekeningTable data={data} />
    </div>
  );
}
