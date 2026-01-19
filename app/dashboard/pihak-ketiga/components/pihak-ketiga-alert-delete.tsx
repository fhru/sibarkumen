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
import { deletePihakKetiga } from '@/drizzle/actions/pihak-ketiga';
import { toast } from 'sonner';
import { useState } from 'react';

interface PihakKetigaAlertDeleteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pihakKetigaId: number | null;
}

export function PihakKetigaAlertDelete({
  open,
  setOpen,
  pihakKetigaId,
}: PihakKetigaAlertDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (pihakKetigaId) {
      setIsDeleting(true);
      const result = await deletePihakKetiga(pihakKetigaId);
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
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pihak
            ketiga secara permanen.
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
