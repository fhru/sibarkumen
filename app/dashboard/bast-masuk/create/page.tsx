import { db } from '@/lib/db';
import {
  barang,
  satuan,
  asalPembelian,
  rekening,
  pihakKetiga,
  pegawai,
} from '@/drizzle/schema';
import { BastMasukForm } from '../components/bast-masuk-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Buat BAST Masuk',
  description: 'Input data penerimaan barang baru',
};

export default async function CreateBastMasukPage() {
  const [
    barangList,
    satuanList,
    asalList,
    rekeningList,
    pihakList,
    pegawaiList,
  ] = await Promise.all([
    db.select({ id: barang.id, nama: barang.nama }).from(barang),
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
    db.select({ id: pihakKetiga.id, nama: pihakKetiga.nama }).from(pihakKetiga),
    db.select({ id: pegawai.id, nama: pegawai.nama }).from(pegawai),
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
          barangList={barangList}
          satuanList={satuanList}
          asalPembelianList={asalList}
          rekeningList={rekeningList}
          pihakKetigaList={pihakList}
          pegawaiList={pegawaiList}
        />
      </div>
    </div>
  );
}
