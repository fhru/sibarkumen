import { BastKeluarForm } from '@/components/bast-keluar/bast-keluar-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CreateBastKeluarPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buat BAST Keluar</h1>
      </div>
      <BastKeluarForm />
    </div>
  );
}
