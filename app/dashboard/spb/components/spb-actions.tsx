'use client';

import { useState } from 'react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  deleteSPB,
  toggleSPBPrintStatus,
  cancelSPB,
} from '@/drizzle/actions/spb';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash, Printer, Plus, CheckCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface SPBActionsProps {
  id: number;
  status: string;
}

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

  const handleTogglePrintStatus = async () => {
    setIsToggling(true);
    try {
      const newIsPrinted = !isPrinted;
      // @ts-ignore
      const result = await toggleSPBPrintStatus(id, newIsPrinted);
      if (result.success) {
        toast.success('Status cetak berhasil diperbarui');
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Gagal update status cetak');
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      // @ts-ignore
      const result = await cancelSPB(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Gagal update status cetak');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'MENUNGGU_SPPB' && (
        <Link href={`/dashboard/sppb/create?spbId=${id}`}>
          <Button variant="outline" size={'sm'}>
            <Plus className="mr-2 h-4 w-4" />
            Buat SPPB
          </Button>
        </Link>
      )}

      <Link href={`/print/spb/${id}`} target="_blank">
        <Button variant="outline" size={'sm'}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </Link>

      <Button
        onClick={handleTogglePrintStatus}
        disabled={isToggling}
        variant="outline"
        size={'sm'}
      >
        {isPrinted ? (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            {isToggling ? 'Memproses...' : 'Tandai Belum Dicetak'}
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isToggling ? 'Memproses...' : 'Tandai Sudah Dicetak'}
          </>
        )}
      </Button>

      {status === 'MENUNGGU_SPPB' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isCanceling} size={'sm'}>
              <Trash className="mr-2 h-4 w-4" />
              {isCanceling ? 'Membatalkan...' : 'Batalkan'}
            </Button>
          </AlertDialogTrigger>
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
      )}
    </div>
  );
}
