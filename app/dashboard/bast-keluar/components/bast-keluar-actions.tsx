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
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteBastKeluar,
  toggleBastKeluarPrintStatus,
} from "@/drizzle/actions/bast-keluar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Role } from "@/config/nav-items";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BastKeluarActions({ bast }: { bast: any }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPrint, startTwTogglingPrint] = useTransition();
  const session = authClient.useSession();
  const userRole = session.data?.user.role as Role | undefined;
  const canManage = userRole !== "supervisor";

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBastKeluar(bast.id);
    if (result.success) {
      toast.success(result.message);
      router.push("/dashboard/bast-keluar");
    } else {
      toast.error(result.message);
      setIsDeleting(false);
    }
  };

  const handleTogglePrintStatus = async () => {
    startTwTogglingPrint(async () => {
      const result = await toggleBastKeluarPrintStatus(bast.id);
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
      <Link href={`/print/bast-keluar/${bast.id}`} target="_blank">
        <Button>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </Link>

      {canManage && (
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
              {bast.isPrinted ? (
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
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/bast-keluar/${bast.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setShowDeleteDialog(true)}
              variant="destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus BAST Keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus BAST Keluar {bast.nomorBast}?
              Tindakan ini akan mengembalikan status SPPB menjadi &quot;Menunggu
              BAST&quot;.
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
