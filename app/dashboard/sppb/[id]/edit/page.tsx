import { getSPPBById } from "@/drizzle/data/sppb";
import { SPPBForm } from "../../components/sppb-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditSPPBPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getSPPBById(Number(id));

  if (!result.success || !result.data) {
    notFound();
  }

  const sppb = result.data;

  // Only allow editing if not completed
  if (sppb.serahTerimaOlehId) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/sppb/${id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit SPPB</h2>
            <p className="text-sm text-destructive">
              SPPB sudah diselesaikan, tidak bisa diubah
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href={`/dashboard/sppb/${id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit SPPB</h2>
          <p className="text-muted-foreground text-sm">
            Ubah data surat perintah pengeluaran barang
          </p>
        </div>
      </div>

      <SPPBForm
        pendingSPBs={[]}
        initialData={{
          spbId: sppb.spbId,
          tanggalSppb: new Date(sppb.tanggalSppb),
          pejabatPenyetujuId: sppb.pejabatPenyetujuId,
          diterimaOlehId: sppb.diterimaOlehId,
          keterangan: sppb.keterangan || "",
          items:
            sppb.items?.map((item) => ({
              barangId: item.barangId,
              qtyDisetujui: item.qtyDisetujui,
              keterangan: item.keterangan || "",
            })) || [],
        }}
        sppbId={Number(id)}
      />
    </div>
  );
}
