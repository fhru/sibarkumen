import { BastKeluarForm } from '@/components/bast-keluar/bast-keluar-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPegawaiOptions } from '@/app/actions/pegawai';
import { getPejabatOptions } from '@/app/actions/pejabat';
import { getSppbOptions } from '@/app/actions/bast-keluar';

export default async function CreateBastKeluarPage() {
  const session = await auth();
  if (!session) redirect('/login');

  // Prefetch all dropdown data in parallel
  const [pegawaiOptions, pejabatOptions, sppbOptions] = await Promise.all([
    getPegawaiOptions(),
    getPejabatOptions(),
    getSppbOptions()
  ]);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buat BAST Keluar</h1>
      </div>
      <BastKeluarForm 
        pegawaiOptions={pegawaiOptions}
        pejabatOptions={pejabatOptions}
        sppbOptions={sppbOptions}
      />
    </div>
  );
}
