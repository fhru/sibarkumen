import { db } from '@/lib/db';
import { pegawai, jabatan } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { PegawaiTable } from './components/pegawai-table';
import { PegawaiStats } from './components/pegawai-stats';

export const dynamic = 'force-dynamic';

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pegawai</h2>
          <p className="text-muted-foreground">
            Kelola data pegawai dan staff di sini.
          </p>
        </div>
      </div>
      <PegawaiStats totalPegawai={data.length} />
      <PegawaiTable data={data} jabatanList={jabatanList} />
    </div>
  );
}
