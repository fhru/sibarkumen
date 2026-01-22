'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Plus,
  MoreHorizontal,
  Printer,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import { toggleSPBPrintStatus, cancelSPB } from '@/drizzle/actions/spb';
import { useRouter } from 'next/navigation';
import { SPBStatusBadge } from './spb-status-badge';

export type SPB = {
  id: number;
  nomorSpb: string;
  tanggalSpb: string;
  pemohonId: number;
  status: 'MENUNGGU_SPPB' | 'SELESAI' | 'BATAL';
  isPrinted: boolean;
  keterangan: string | null;
  createdAt: Date;
  updatedAt: Date;
  pemohon: {
    id: number | null;
    nama: string | null;
    nip: string | null;
  } | null;
  totalItems: number;
};

// Sortable Header Component to reuse
const SortableHeader = ({
  columnId,
  title,
  currentSortBy,
  currentSortOrder,
  onSort,
}: {
  columnId: string;
  title: string;
  currentSortBy: string;
  currentSortOrder: string;
  onSort: (columnId: string) => void;
}) => {
  const getSortIcon = () => {
    if (currentSortBy !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (currentSortOrder === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(columnId)}
      className="h-8 px-2"
    >
      {title}
      {getSortIcon()}
    </Button>
  );
};

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
import { useState } from 'react';

const SPBActionCell = ({ row }: { row: any }) => {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handlePrintToggle = async () => {
    const newIsPrinted = !row.original.isPrinted;
    const actionText = newIsPrinted
      ? 'Tandai Sudah Dicetak'
      : 'Tandai Belum Dicetak';

    toast.promise(toggleSPBPrintStatus(row.original.id, newIsPrinted), {
      loading: 'Mengupdate status cetak...',
      success: (data) => {
        if (data.success) {
          router.refresh();
          return 'Status cetak berhasil diperbarui';
        }
        throw new Error(data.message);
      },
      error: (err) => err.message || 'Gagal update status cetak',
    });
  };

  const handleCancel = async () => {
    toast.promise(cancelSPB(row.original.id), {
      loading: 'Membatalkan SPB...',
      success: (data) => {
        if (data.success) {
          router.refresh();
          return 'SPB berhasil dibatalkan';
        }
        throw new Error(data.message);
      },
      error: (err) => err.message || 'Gagal membatalkan SPB',
    });
  };

  return (
    <>
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan SPB?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. SPB akan ditandai sebagai
              BATAL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} variant={'destructive'}>
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-full">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => router.push(`/dashboard/spb/${row.original.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>

          {row.original.status === 'MENUNGGU_SPPB' && (
            <DropdownMenuItem
              onSelect={() =>
                router.push(`/dashboard/sppb/create?spbId=${row.original.id}`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat SPPB
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={handlePrintToggle}>
            {!row.original.isPrinted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Tandai Sudah Dicetak
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Tandai Belum Dicetak
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              window.open(`/print/spb/${row.original.id}`, '_blank');
            }}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print SPB
          </DropdownMenuItem>

          {row.original.status === 'MENUNGGU_SPPB' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowCancelDialog(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                Batalkan
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const createColumns = (
  currentSortBy: string,
  currentSortOrder: string,
  onSort: (columnId: string) => void
): ColumnDef<SPB>[] => [
  {
    accessorKey: 'nomorSpb',
    header: () => (
      <SortableHeader
        columnId="nomorSpb"
        title="Nomor SPB"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/spb/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue('nomorSpb')}
      </Link>
    ),
  },
  {
    accessorKey: 'tanggalSpb',
    header: () => (
      <SortableHeader
        columnId="tanggalSpb"
        title="Tanggal"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue('tanggalSpb')), 'dd MMM yyyy', {
        locale: localeId,
      }),
  },
  {
    id: 'pemohon',
    accessorFn: (row) => row.pemohon?.nama || '-',
    header: () => (
      <SortableHeader
        columnId="pemohon"
        title="Pemohon"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.pemohon?.nama || '-'}</div>
        {row.original.pemohon?.nip && (
          <div className="text-sm text-muted-foreground">
            NIP: {row.original.pemohon.nip}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => (
      <SortableHeader
        columnId="status"
        title="Status"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => <SPBStatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'isPrinted',
    header: 'Dicetak',
    cell: ({ row }) => {
      const isPrinted = row.getValue('isPrinted') as boolean;
      return isPrinted ? (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
        >
          Sudah
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          Belum
        </Badge>
      );
    },
  },
  {
    accessorKey: 'totalItems',
    header: 'Jumlah Item',
    cell: ({ row }) => {
      const total = row.getValue('totalItems') as number;
      return <span className="font-medium">{total} item</span>;
    },
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => {
      const keterangan = row.getValue('keterangan') as string | null;
      return keterangan ? <span className="text-xs">{keterangan}</span> : '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <SPBActionCell row={row} />,
  },
];
