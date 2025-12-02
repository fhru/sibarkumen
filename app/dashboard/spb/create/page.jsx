import { SpbForm } from '@/components/spb/spb-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPegawaiOptions } from '@/app/actions/pegawai';
import { getBarangOptions } from '@/app/actions/barang';

export default async function CreateSpbPage() {
  const session = await auth();
  if (!session) redirect('/login');

  // Prefetch all dropdown data in parallel
  const [pegawaiOptions, barangOptions] = await Promise.all([
    getPegawaiOptions(),
    getBarangOptions()
  ]);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buat Permintaan Barang (SPB)</h1>
      </div>
      <SpbForm 
        pegawaiOptions={pegawaiOptions}
        barangOptions={barangOptions}
      />
    </div>
  );
}
