import { db } from '@/lib/db';
import { rekening } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { RekeningTable } from './components/rekening-table';
import { RekeningStats } from './components/rekening-stats';
import { RekeningDialogCreate } from './components/rekening-dialog-create';
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
  title: 'Rekening | Sibarkumen',
  description: 'Kelola daftar rekening bank di sini.',
};

export default async function RekeningPage() {
  const data = await db.select().from(rekening).orderBy(desc(rekening.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Rekening</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rekening</h2>
          <p className="text-muted-foreground">
            Kelola daftar rekening bank di sini.
          </p>
        </div>
        <RekeningDialogCreate />
      </div>

      <RekeningStats totalRekening={data.length} />

      <div className="flex h-full flex-1 flex-col space-y-6">
        <RekeningTable data={data} />
      </div>
    </div>
  );
}
