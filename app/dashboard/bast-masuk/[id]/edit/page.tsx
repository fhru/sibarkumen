import { db } from '@/lib/db';
import {
  barang,
  satuan,
  asalPembelian,
  rekening,
  pihakKetiga,
  pegawai,
} from '@/drizzle/schema';
import { BastMasukForm } from '../../components/bast-masuk-form';
import { getBastMasukById } from '@/drizzle/data/bast-masuk';
import { notFound } from 'next/navigation';

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

  const [
    initialData,
    barangList,
    satuanList,
    asalList,
    rekeningList,
    pihakList,
    pegawaiList,
  ] = await Promise.all([
    getBastMasukById(bastId),
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

  if (!initialData) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit BAST Masuk</h2>
          <p className="text-muted-foreground">
            Edit data penerimaan barang yang sudah ada.
          </p>
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
          initialData={initialData}
        />
      </div>
    </div>
  );
}
