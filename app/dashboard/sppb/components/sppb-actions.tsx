"use client";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash,
  CheckCircle,
  Printer,
  RotateCcw,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteSPPB,
  completeSPPB,
  toggleSPPBPrintStatus,
} from "@/drizzle/actions/sppb";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AsyncSelect } from "@/components/ui/async-select";
import { searchPegawai } from "@/drizzle/actions/search";

export function SPPBActions({ sppb }: { sppb: any }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [serahTerimaOlehId, setSerahTerimaOlehId] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTogglingPrint, startTwTogglingPrint] = useTransition();

  const isCompleted = !!sppb.serahTerimaOleh;
  const canCreateBast =
    sppb.status === "MENUNGGU_BAST" && !sppb.bastKeluarList?.length;

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteSPPB(sppb.id);
    if (result.success) {
      toast.success(result.message);
      router.push("/dashboard/sppb");
    } else {
      toast.error(result.message);
      setIsDeleting(false);
    }
  };

  const handleComplete = async () => {
    if (!serahTerimaOlehId) {
      toast.error("Pilih petugas serah terima");
      return;
    }

    setIsCompleting(true);
    const result = await completeSPPB(sppb.id, null, { serahTerimaOlehId });
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      setShowCompleteDialog(false);
    } else {
      toast.error(result.message);
    }
    setIsCompleting(false);
  };

  const handleTogglePrintStatus = async () => {
    startTwTogglingPrint(async () => {
      const result = await toggleSPPBPrintStatus(sppb.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/print/sppb/${sppb.id}`} target="_blank">
        <Button variant="outline" size={"sm"}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </Link>

      <Button
        onClick={handleTogglePrintStatus}
        disabled={isTogglingPrint}
        variant="outline"
        size={"sm"}
      >
        {sppb.isPrinted ? (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            {isTogglingPrint ? "Memproses..." : "Tandai Belum Dicetak"}
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isTogglingPrint ? "Memproses..." : "Tandai Sudah Dicetak"}
          </>
        )}
      </Button>

      {!isCompleted && (
        <>
          <Link href={`/dashboard/sppb/${sppb.id}/edit`}>
            <Button variant="outline" size={"sm"}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size={"sm"}
            onClick={() => setShowCompleteDialog(true)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Selesaikan
          </Button>
        </>
      )}

      {canCreateBast && (
        <Link href={`/dashboard/bast-keluar/create?sppbId=${sppb.id}`}>
          <Button variant="outline" size={"sm"}>
            <Plus className="mr-2 h-4 w-4" />
            Buat BAST
          </Button>
        </Link>
      )}

      <Button
        variant="destructive"
        onClick={() => setShowDeleteDialog(true)}
        disabled={isCompleted}
        size={"sm"}
      >
        <Trash className="mr-2 h-4 w-4" />
        Hapus
      </Button>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus SPPB?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus SPPB {sppb.nomorSppb}? Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant={"destructive"}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan SPPB?</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih petugas yang menyerahkan barang. Stok akan dikurangi setelah
              diselesaikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <AsyncSelect
              value={serahTerimaOlehId}
              onValueChange={setSerahTerimaOlehId}
              loadOptions={searchPegawai}
              placeholder="Pilih Petugas Serah Terima"
              searchPlaceholder="Cari pegawai..."
              formatLabel={(option) => `${option.nama} - ${option.nip || ""}`}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={isCompleting || !serahTerimaOlehId}
            >
              {isCompleting ? "Memproses..." : "Selesaikan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
