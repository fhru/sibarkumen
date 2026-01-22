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
import { deleteBastMasuk } from '@/drizzle/actions/bast-masuk';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BastMasukAlertDeleteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  bastMasukId: number;
}

export function BastMasukAlertDelete({
  open,
  setOpen,
  bastMasukId,
}: BastMasukAlertDeleteProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteBastMasuk(bastMasukId);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Menghapus BAST Masuk akan
            mengembalikan stok barang sesuai dengan jumlah yang diterima.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              confirmDelete();
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
