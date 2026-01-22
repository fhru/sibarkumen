import { db } from '@/lib/db';
import { asalPembelian } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { AsalPembelianTable } from './components/asal-pembelian-table';
import { AsalPembelianStats } from './components/asal-pembelian-stats';
import { AsalPembelianDialogCreate } from './components/asal-pembelian-dialog-create';
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
  title: 'Asal Pembelian | Sibarkumen',
  description: 'Kelola daftar asal pembelian di sini.',
};

export default async function AsalPembelianPage() {
  const data = await db
    .select()
    .from(asalPembelian)
    .orderBy(desc(asalPembelian.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Asal Pembelian</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asal Pembelian</h2>
          <p className="text-muted-foreground">
            Kelola daftar asal pembelian di sini.
          </p>
        </div>
        <AsalPembelianDialogCreate />
      </div>

      <AsalPembelianStats totalAsalPembelian={data.length} />

      <div className="flex h-full flex-1 flex-col space-y-6">
        <AsalPembelianTable data={data} />
      </div>
    </div>
  );
}
