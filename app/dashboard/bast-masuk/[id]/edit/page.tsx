import { db } from '@/lib/db';
import { satuan, asalPembelian, rekening } from '@/drizzle/schema';
import { BastMasukForm } from '../../components/bast-masuk-form';
import { getBastMasukById } from '@/drizzle/data/bast-masuk';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'Edit BAST Masuk',
  description: 'Edit data penerimaan barang',
};

interface EditBastMasukPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBastMasukPage({
  params,
}: EditBastMasukPageProps) {
  const { id } = await params;
  const bastId = Number(id);

  if (isNaN(bastId)) {
    notFound();
  }

  const [satuanList, asalList, rekeningList, bastData] = await Promise.all([
    db.select({ id: satuan.id, nama: satuan.nama }).from(satuan),
    db
      .select({ id: asalPembelian.id, nama: asalPembelian.nama })
      .from(asalPembelian),
    db
      .select({
        id: rekening.id,
        nama: rekening.namaPemilik,
        namaBank: rekening.namaBank,
        nomorRekening: rekening.nomorRekening,
      })
      .from(rekening),
    getBastMasukById(bastId),
  ]);

  if (!bastData.success || !bastData.data) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/bast-masuk">
              BAST Masuk
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit BAST Masuk</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit BAST Masuk</h2>
        <p className="text-sm text-muted-foreground">
          Perbarui data penerimaan barang.
        </p>
      </div>

      <BastMasukForm
        satuanList={satuanList}
        asalPembelianList={asalList}
        rekeningList={rekeningList}
        initialData={bastData.data}
      />
    </div>
  );
}
