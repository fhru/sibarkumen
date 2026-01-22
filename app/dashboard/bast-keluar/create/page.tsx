import { BastKeluarForm } from '../components/bast-keluar-form';
import { db } from '@/lib/db';
import { sppb } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'Buat BAST Keluar Baru',
  description: 'Buat berita acara serah terima barang keluar baru',
};

export default async function CreateBastKeluarPage({
  searchParams,
}: {
  searchParams: Promise<{ sppbId?: string }>;
}) {
  const params = await searchParams;
  const preSelectedSppbId = params.sppbId ? Number(params.sppbId) : undefined;

  // Fetch completed SPPBs
  const completedSPPBs = await db.query.sppb.findMany({
    where: eq(sppb.status, 'MENUNGGU_BAST'),
    with: {
      spb: { 
        columns: { nomorSpb: true, pemohonId: true },
        with: {
            pemohon: { columns: { id: true, nama: true, nip: true } }
        }
      },
      items: {
        with: {
          barang: { columns: { id: true, nama: true, kodeBarang: true } },
        },
      },
    },
    orderBy: (sppb, { desc }) => [desc(sppb.tanggalSppb)],
  });

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4 pb-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/bast-keluar">
              BAST Keluar
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Buat Baru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Buat BAST Keluar Baru
          </h2>
          <p className="text-muted-foreground text-sm">
            Buat berita acara serah terima barang keluar dari SPPB yang telah
            diselesaikan
          </p>
        </div>
      </div>

      <BastKeluarForm
        completedSPPBs={completedSPPBs}
        preSelectedSppbId={preSelectedSppbId}
      />
    </div>
  );
}
