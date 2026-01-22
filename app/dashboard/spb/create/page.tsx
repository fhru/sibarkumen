import { SPBForm } from '../components/spb-form';
import { generateNextSPBNumber } from '@/drizzle/actions/generate-number';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'Buat SPB Baru',
  description: 'Buat surat permintaan barang baru',
};

export default async function CreateSPBPage() {
  const nomorSpb = await generateNextSPBNumber();

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/spb">SPB</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Buat SPB Baru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buat SPB Baru</h2>
          <p className="text-sm text-muted-foreground">
            Isi formulir untuk mengajukan permintaan barang baru.
          </p>
        </div>
      </div>

      <SPBForm generatedNomorSpb={nomorSpb} />
    </div>
  );
}
