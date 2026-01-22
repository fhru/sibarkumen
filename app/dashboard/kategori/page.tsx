import { db } from '@/lib/db';
import { kategori } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { KategoriTable } from './components/kategori-table';
import { KategoriStats } from './components/kategori-stats';
import { KategoriDialogCreate } from './components/kategori-dialog-create';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kategori | Sibarkumen',
  description: 'Kelola daftar kategori barang di sini.',
};

export default async function KategoriPage() {
  const data = await db.select().from(kategori).orderBy(desc(kategori.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Kategori</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori</h2>
          <p className="text-muted-foreground">
            Kelola daftar kategori barang di sini.
          </p>
        </div>
        <KategoriDialogCreate />
      </div>

      <KategoriStats totalKategori={data.length} />

      <div className="flex h-full flex-1 flex-col space-y-6">
        <KategoriTable data={data} />
      </div>
    </div>
  );
}
