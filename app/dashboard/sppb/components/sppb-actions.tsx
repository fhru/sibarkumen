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
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteSPPB, toggleSPPBPrintStatus } from "@/drizzle/actions/sppb";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SPPBActions({ sppb }: { sppb: any }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
        <Button>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </Link>

      {canCreateBast && (
        <Link href={`/dashboard/bast-keluar/create?sppbId=${sppb.id}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat BAST
          </Button>
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-full">
          <DropdownMenuItem
            onSelect={handleTogglePrintStatus}
            disabled={isTogglingPrint}
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
          </DropdownMenuItem>

          {!isCompleted && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/sppb/${sppb.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            disabled={isCompleted}
            variant="destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </div>
  );
}
