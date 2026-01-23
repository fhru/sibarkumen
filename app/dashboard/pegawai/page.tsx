import { db } from '@/lib/db';
import { pegawai, jabatan } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { PegawaiTable } from './components/pegawai-table';
import { PegawaiStats } from './components/pegawai-stats';
import { PegawaiDialogCreate } from './components/pegawai-dialog-create';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pegawai | Sibarkumen',
  description: 'Kelola data pegawai dan staff di sini.',
};

export default async function PegawaiPage() {
  // Fetch Pegawai with their Jabatan relations
  const rawData = await db.query.pegawai.findMany({
    with: {
      pegawaiJabatan: {
        with: {
          jabatan: true,
        },
        orderBy: (pj, { desc }) => [desc(pj.id)], // Consistent ordering
      },
    },
    orderBy: [desc(pegawai.id)],
  });

  // Sanitize data to avoid passing Date objects or unstable references to Client Components
  const data = rawData.map((p) => ({
    id: p.id,
    nama: p.nama,
    nip: p.nip,
    userId: p.userId,
    pegawaiJabatan: p.pegawaiJabatan.map((pj) => ({
      id: pj.id,
      isAktif: pj.isAktif,
      jabatan: {
        id: pj.jabatan.id,
        nama: pj.jabatan.nama,
      },
    })),
  }));

  // Fetch Jabatan list for the dropdown
  const jabatanList = await db.select().from(jabatan).orderBy(desc(jabatan.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pegawai</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pegawai</h2>
          <p className="text-muted-foreground">
            Kelola data pegawai dan staff di sini.
          </p>
        </div>
        <PegawaiDialogCreate />
      </div>

      <PegawaiStats totalPegawai={data.length} />
      <PegawaiTable data={data} jabatanList={jabatanList} />
    </div>
  );
}
