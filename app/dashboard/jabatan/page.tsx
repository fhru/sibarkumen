import { db } from '@/lib/db';
import { jabatan } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { JabatanTable } from './components/jabatan-table';
import { JabatanStats } from './components/jabatan-stats';

export const dynamic = 'force-dynamic';

export default async function JabatanPage() {
  const data = await db.select().from(jabatan).orderBy(desc(jabatan.id));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jabatan</h2>
          <p className="text-muted-foreground">
            Kelola daftar jabatan di sini.
          </p>
        </div>
      </div>
      <JabatanStats totalJabatan={data.length} />
      <JabatanTable data={data} />
    </div>
  );
}
