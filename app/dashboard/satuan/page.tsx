import { db } from '@/lib/db';
import { satuan } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { SatuanTable } from './components/satuan-table';
import { SatuanStats } from './components/satuan-stats';

export const dynamic = 'force-dynamic';

export default async function SatuanPage() {
  const data = await db.select().from(satuan).orderBy(desc(satuan.id));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Satuan</h2>
          <p className="text-muted-foreground">
            Kelola daftar satuan barang di sini.
          </p>
        </div>
      </div>
      <SatuanStats totalSatuan={data.length} />
      <SatuanTable data={data} />
    </div>
  );
}
