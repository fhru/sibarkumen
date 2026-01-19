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
import { deleteUser } from '@/drizzle/actions/users';
import { toast } from 'sonner';
import { useState } from 'react';

interface UserAlertDeleteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string | null;
}

export function UserAlertDelete({
  open,
  setOpen,
  userId,
}: UserAlertDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (userId) {
      setIsDeleting(true);
      const result = await deleteUser(userId);
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
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus user secara
            permanen.
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
