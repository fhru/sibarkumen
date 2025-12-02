import { SppbForm } from '@/components/sppb/sppb-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPegawaiOptions } from '@/app/actions/pegawai';
import { getPejabatOptions } from '@/app/actions/pejabat';
import { getSpbOptions } from '@/app/actions/sppb';

export default async function CreateSppbPage() {
  const session = await auth();
  if (!session) redirect('/login');

  // Prefetch all dropdown data in parallel
  const [pegawaiOptions, pejabatOptions, spbOptions] = await Promise.all([
    getPegawaiOptions(),
    getPejabatOptions(),
    getSpbOptions()
  ]);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buat Surat Perintah Penyaluran (SPPB)</h1>
      </div>
      <SppbForm 
        pegawaiOptions={pegawaiOptions}
        pejabatOptions={pejabatOptions}
        spbOptions={spbOptions}
      />
    </div>
  );
}
