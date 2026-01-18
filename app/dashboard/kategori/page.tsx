import { db } from '@/lib/db';
import { kategori } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { KategoriTable } from './components/kategori-table';
import { KategoriStats } from './components/kategori-stats';

export const dynamic = 'force-dynamic';

export default async function KategoriPage() {
  const data = await db.select().from(kategori).orderBy(desc(kategori.id));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori</h2>
          <p className="text-muted-foreground">
            Kelola daftar kategori barang di sini.
          </p>
        </div>
      </div>
      <KategoriStats totalKategori={data.length} />
      <KategoriTable data={data} />
    </div>
  );
}
