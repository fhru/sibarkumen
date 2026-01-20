import { db } from '@/lib/db';
import { satuan, asalPembelian, rekening } from '@/drizzle/schema';
import { BastMasukForm } from '../components/bast-masuk-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Buat BAST Masuk',
  description: 'Input data penerimaan barang baru',
};

export default async function CreateBastMasukPage() {
  const [satuanList, asalList, rekeningList] = await Promise.all([
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/bast-masuk">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Buat BAST Masuk
            </h2>
            <p className="text-muted-foreground">
              Isi formulir berikut untuk mencatat penerimaan barang.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <BastMasukForm
          satuanList={satuanList}
          asalPembelianList={asalList}
          rekeningList={rekeningList}
        />
      </div>
    </div>
  );
}
