'use client';

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
import { deleteAsalPembelian } from '@/drizzle/actions/asal-pembelian';
import { toast } from 'sonner';
import { useState } from 'react';

interface AsalPembelianAlertDeleteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  asalPembelianId: number | null;
}

export function AsalPembelianAlertDelete({
  open,
  setOpen,
  asalPembelianId,
}: AsalPembelianAlertDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (asalPembelianId) {
      setIsDeleting(true);
      const result = await deleteAsalPembelian(asalPembelianId);
      setIsDeleting(false);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data asal
            pembelian secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            variant={'destructive'}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
