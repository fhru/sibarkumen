import { db } from '@/lib/db';
import { satuan, asalPembelian, kodeRekening } from '@/drizzle/schema';
import { BastMasukForm } from '../components/bast-masuk-form';
import { generateDocumentNumber } from '@/lib/document-numbering-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink, Info } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'Buat BAST Masuk',
  description: 'Input data penerimaan barang baru',
};

export default async function CreateBastMasukPage() {
  const [satuanList, asalList, rekeningList, nextNumber] = await Promise.all([
    db.select({ id: satuan.id, nama: satuan.nama }).from(satuan),
    db
      .select({ id: asalPembelian.id, nama: asalPembelian.nama })
      .from(asalPembelian),
    db
      .select({
        id: kodeRekening.id,
        nama: kodeRekening.kode, // Mapping kode to nama for Option compatibility
        kode: kodeRekening.kode,
        uraian: kodeRekening.uraian,
      })
      .from(kodeRekening),
    generateDocumentNumber('bastMasuk'),
  ]);

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
            <BreadcrumbPage>Buat BAST Masuk</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buat BAST Masuk</h2>
          <p className="text-sm text-muted-foreground">
            Catat penerimaan barang baru ke dalam sistem.
          </p>
        </div>
      </div>

      <BastMasukForm
        satuanList={satuanList}
        asalPembelianList={asalList}
        rekeningList={rekeningList}
        nextNomorReferensi={nextNumber}
      />
    </div>
  );
}
