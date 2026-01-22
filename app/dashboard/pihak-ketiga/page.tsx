import { db } from '@/lib/db';
import { pihakKetiga } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { PihakKetigaTable } from './components/pihak-ketiga-table';
import { PihakKetigaStats } from './components/pihak-ketiga-stats';
import { PihakKetigaDialogCreate } from './components/pihak-ketiga-dialog-create';
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
  title: 'Pihak Ketiga | Sibarkumen',
  description: 'Kelola daftar pihak ketiga (supplier/rekanan) di sini.',
};

export default async function PihakKetigaPage() {
  const data = await db
    .select()
    .from(pihakKetiga)
    .orderBy(desc(pihakKetiga.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pihak Ketiga</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pihak Ketiga</h2>
          <p className="text-muted-foreground">
            Kelola daftar pihak ketiga (supplier/rekanan) di sini.
          </p>
        </div>
        <PihakKetigaDialogCreate />
      </div>

      <PihakKetigaStats totalPihakKetiga={data.length} />

      <div className="flex h-full flex-1 flex-col space-y-6">
        <PihakKetigaTable data={data} />
      </div>
    </div>
  );
}
