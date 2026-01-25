"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleSPBPrintStatus, cancelSPB } from "@/drizzle/actions/spb";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Trash,
  Printer,
  Plus,
  CheckCircle,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Role } from "@/config/nav-items";

export function SPBActions({
  id,
  status,
  isPrinted,
}: {
  id: number;
  status: string;
  isPrinted: boolean;
}) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const session = authClient.useSession();
  const userRole = session.data?.user.role as Role | undefined;
  const canCreateSppb = status === "MENUNGGU_SPPB" && userRole !== "petugas";
  const canPrint = userRole !== "petugas" || status === "SELESAI";
  const canTogglePrint = canPrint;
  const canCancel = status === "MENUNGGU_SPPB" && userRole !== "petugas";
  const hasMenu = canCreateSppb || canTogglePrint || canCancel;

  const handleTogglePrintStatus = async () => {
    setIsToggling(true);
    try {
      const newIsPrinted = !isPrinted;
      const result = await toggleSPBPrintStatus(id, newIsPrinted);
      if (result.success) {
        toast.success("Status cetak berhasil diperbarui");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal update status cetak");
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const result = await cancelSPB(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal update status cetak");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canPrint && (
        <Link href={`/print/spb/${id}`} target="_blank">
          <Button>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </Link>
      )}

      {hasMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            {canCreateSppb && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/sppb/create?spbId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat SPPB
                </Link>
              </DropdownMenuItem>
            )}

            {canTogglePrint && (
              <DropdownMenuItem
                onSelect={handleTogglePrintStatus}
                disabled={isToggling}
              >
                {isPrinted ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {isToggling ? "Memproses..." : "Tandai Belum Dicetak"}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isToggling ? "Memproses..." : "Tandai Sudah Dicetak"}
                  </>
                )}
              </DropdownMenuItem>
            )}

            {canCancel && (
              <>
                <DropdownMenuItem
                  onSelect={() => setShowCancelDialog(true)}
                  disabled={isCanceling}
                  variant="destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {isCanceling ? "Membatalkan..." : "Batalkan"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan SPB?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan SPB ini? Status akan berubah
              menjadi BATAL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} variant="destructive">
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
