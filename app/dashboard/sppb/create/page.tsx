import { SPPBForm } from "../components/sppb-form";
import { db } from "@/lib/db";
import { spb } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = {
  title: "Buat SPPB Baru",
  description: "Buat surat perintah pengeluaran barang baru",
};

export default async function CreateSPPBPage({
  searchParams,
}: {
  searchParams: Promise<{ spbId?: string }>;
}) {
  const params = await searchParams;
  const preSelectedSpbId = params.spbId ? Number(params.spbId) : undefined;

  // Fetch SPBs
  const pendingSPBs = await db.query.spb.findMany({
    where: eq(spb.status, "MENUNGGU_SPPB"),
    with: {
      pemohon: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      items: {
        with: {
          barang: {
            columns: {
              id: true,
              nama: true,
              kodeBarang: true,
              stok: true,
            },
          },
        },
      },
    },
    orderBy: (spb, { desc }) => [desc(spb.tanggalSpb)],
  });

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/sppb">SPPB</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Buat SPPB Baru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buat SPPB Baru</h2>
          <p className="text-sm text-muted-foreground">
            Isi formulir untuk membuat Surat Perintah Pengeluaran Barang.
          </p>
        </div>
      </div>

      <SPPBForm pendingSPBs={pendingSPBs} preSelectedSpbId={preSelectedSpbId} />
    </div>
  );
}
