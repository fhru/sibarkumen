'use client';
import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Edit,
  Trash,
  CheckCircle,
  Printer,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  deleteBastKeluar,
  toggleBastKeluarPrintStatus,
} from '@/drizzle/actions/bast-keluar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function BastKeluarActions({ bast }: { bast: any }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPrint, startTwTogglingPrint] = useTransition();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBastKeluar(bast.id);
    if (result.success) {
      toast.success(result.message);
      router.push('/dashboard/bast-keluar');
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
        <Button variant="outline" size={'sm'}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </Link>

      <Button
        onClick={handleTogglePrintStatus}
        disabled={isTogglingPrint}
        variant="outline"
        size={'sm'}
      >
        {bast.isPrinted ? (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            {isTogglingPrint ? 'Memproses...' : 'Tandai Belum Dicetak'}
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isTogglingPrint ? 'Memproses...' : 'Tandai Sudah Dicetak'}
          </>
        )}
      </Button>

      <Link href={`/dashboard/bast-keluar/${bast.id}/edit`}>
        <Button variant="outline" size={'sm'}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </Link>

      <Button
        variant="destructive"
        onClick={() => setShowDeleteDialog(true)}
        size={'sm'}
      >
        <Trash className="mr-2 h-4 w-4" />
        Hapus
      </Button>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus BAST Keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus BAST Keluar {bast.nomorBast}?
              Tindakan ini akan mengembalikan status SPPB menjadi "Menunggu
              BAST".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant={'destructive'}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
