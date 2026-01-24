import { BastKeluarForm } from '../../components/bast-keluar-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { sppb } from '@/drizzle/schema';
import { isNotNull, eq, or } from 'drizzle-orm';
import { getBastKeluarById } from '@/drizzle/actions/bast-keluar';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'Edit BAST Keluar',
  description: 'Ubah berita acara serah terima barang keluar',
};

export default async function EditBastKeluarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bastId = Number(id);

  // Fetch BAST Data
  const result = await getBastKeluarById(bastId);
  if (!result.success || !result.data) notFound();
  const bastData = result.data;

  // Fetch Completed SPPBs (needed for the select, even if disabled)
  const completedSPPBs = await db.query.sppb.findMany({
    where: or(isNotNull(sppb.serahTerimaOlehId), eq(sppb.id, bastData.sppbId)),
    with: {
      spb: {
        columns: { nomorSpb: true, tanggalSpb: true, pemohonId: true },
        with: {
          pemohon: { columns: { id: true, nama: true, nip: true } },
        },
      },
      items: {
        with: {
          barang: { columns: { id: true, nama: true, kodeBarang: true } },
        },
      },
    },
    orderBy: (sppb, { desc }) => [desc(sppb.tanggalSppb)],
  });

  // Transform data for form
  const formattedData = {
    ...bastData,
    sppbId: bastData.sppbId,
    tanggalBast: new Date(bastData.tanggalBast),
    pihakPertamaId: bastData.pihakPertamaId,
    pihakKeduaId: bastData.pihakKeduaId,
    keterangan: bastData.keterangan || '',
    items: bastData.items.map((item) => ({
      barangId: item.barangId,
      qtySerahTerima: item.qtySerahTerima,
      hargaSatuan: Number(item.hargaSatuan),
      persentasePpn: item.persentasePpn,
      keterangan: item.keterangan || '',
    })),
    // Pass full objects for AsyncSelect initial options
    pihakPertama: bastData.pihakPertama,
    pihakKedua: bastData.pihakKedua,
  };

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
            <BreadcrumbLink href={`/dashboard/bast-keluar/${bastId}`}>
              {bastData.nomorBast}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit BAST Keluar
          </h2>
          <p className="text-muted-foreground text-sm">{bastData.nomorBast}</p>
        </div>
      </div>

      <BastKeluarForm
        completedSPPBs={completedSPPBs}
        initialData={formattedData}
        bastKeluarId={bastId}
      />
    </div>
  );
}
