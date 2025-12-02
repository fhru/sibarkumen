import { BastMasukForm } from '@/components/bast-masuk/bast-masuk-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPegawaiOptions } from '@/app/actions/pegawai';
import { getBarangOptions } from '@/app/actions/barang';
import { getAllRekening } from '@/app/actions/rekening';

export default async function CreateBastMasukPage() {
  const session = await auth();
  if (!session) redirect('/login');

  // Prefetch all dropdown data in parallel
  const [pegawaiOptions, rekeningOptions, barangOptions] = await Promise.all([
    getPegawaiOptions(),
    getAllRekening(),
    getBarangOptions()
  ]);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buat Transaksi BAST Masuk</h1>
      </div>
      <BastMasukForm 
        pegawaiOptions={pegawaiOptions}
        rekeningOptions={rekeningOptions}
        barangOptions={barangOptions}
      />
    </div>
  );
}
