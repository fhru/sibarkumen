import { db } from '@/lib/db';
import { satuan } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { SatuanTable } from './components/satuan-table';
import { SatuanStats } from './components/satuan-stats';
import { SatuanDialogCreate } from './components/satuan-dialog-create';
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
  title: 'Satuan | Sibarkumen',
  description: 'Kelola daftar satuan barang di sini.',
};

export default async function SatuanPage() {
  const data = await db.select().from(satuan).orderBy(desc(satuan.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Satuan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Satuan</h2>
          <p className="text-muted-foreground">
            Kelola daftar satuan barang di sini.
          </p>
        </div>
        <SatuanDialogCreate />
      </div>

      <SatuanStats totalSatuan={data.length} />

      <div className="flex h-full flex-1 flex-col space-y-6">
        <SatuanTable data={data} />
      </div>
    </div>
  );
}
