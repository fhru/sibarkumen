import { db } from '@/lib/db';
import { satuan, asalPembelian, rekening } from '@/drizzle/schema';
import { BastMasukForm } from '../../components/bast-masuk-form';
import { getBastMasukById } from '@/drizzle/data/bast-masuk';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Edit BAST Masuk',
  description: 'Edit data penerimaan barang',
};

export default async function EditBastMasukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bastId = parseInt(id);

  const [initialData, satuanList, asalList, rekeningList] = await Promise.all([
    getBastMasukById(bastId),
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
  ]);

  if (!initialData) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/bast-masuk">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Edit BAST Masuk
            </h2>
            <p className="text-muted-foreground">
              Edit data penerimaan barang yang sudah ada.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <BastMasukForm
          satuanList={satuanList}
          asalPembelianList={asalList}
          rekeningList={rekeningList}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
