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
import { deleteJabatan } from '@/drizzle/actions/jabatan';
import { toast } from 'sonner';
import { useState } from 'react';

interface JabatanAlertDeleteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  jabatanId: number | null;
}

export function JabatanAlertDelete({
  open,
  setOpen,
  jabatanId,
}: JabatanAlertDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (jabatanId) {
      setIsDeleting(true);
      const result = await deleteJabatan(jabatanId);
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
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data jabatan
            secara permanen.
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
