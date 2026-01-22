'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BastMasukAlertDelete } from './bast-masuk-alert-delete';

export type BastMasuk = {
  id: number;
  nomorReferensi: string;
  nomorBast: string;
  tanggalBast: string | Date;
  nomorBapb: string;
  tanggalBapb: string | Date;
  pihakKetiga: {
    id: number;
    nama: string;
  } | null;
  pptkPpk: {
    id: number;
    nama: string;
  } | null;
  asalPembelian: {
    id: number;
    nama: string;
  } | null;
  rekening: {
    id: number;
    namaPemilik: string;
    namaBank: string;
    nomorRekening: string;
  } | null;
  keterangan: string | null;
  createdAt: Date;
};

const BastMasukActionCell = ({ item }: { item: BastMasuk }) => {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/bast-masuk/${item.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/bast-masuk/${item.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BastMasukAlertDelete
        open={openDelete}
        setOpen={setOpenDelete}
        bastMasukId={item.id}
      />
    </>
  );
};

const SortableHeader = ({
  column,
  title,
  sortKey,
}: {
  column: any;
  title: string;
  sortKey: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sortBy');
  const currentOrder = searchParams.get('sortOrder');

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSort === sortKey) {
      if (currentOrder === 'asc') {
        params.set('sortOrder', 'desc');
      } else if (currentOrder === 'desc') {
        params.delete('sortBy');
        params.delete('sortOrder');
      }
    } else {
      params.set('sortBy', sortKey);
      params.set('sortOrder', 'asc');
    }

    router.replace(`?${params.toString()}`);
  };

  const getSortIcon = () => {
    if (currentSort !== sortKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (currentOrder === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className="h-8 data-[state=open]:bg-accent"
    >
      {title}
      {getSortIcon()}
    </Button>
  );
};

export const columns: ColumnDef<BastMasuk>[] = [
  {
    accessorKey: 'nomorReferensi',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Nomor Referensi"
        sortKey="nomorReferensi"
      />
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'nomorBast',
    header: ({ column }) => (
      <SortableHeader column={column} title="Nomor BAST" sortKey="nomorBast" />
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'tanggalBast',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Tanggal BAST"
        sortKey="tanggalBast"
      />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('tanggalBast'));
      return (
        <div>{date.toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'nomorBapb',
    header: 'Nomor BAPB',
    enableHiding: true,
  },
  {
    accessorKey: 'tanggalBapb',
    header: 'Tanggal BAPB',
    cell: ({ row }) => {
      const date = new Date(row.getValue('tanggalBapb'));
      return (
        <div>{date.toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
      );
    },
    enableHiding: true,
  },
  {
    id: 'pihakKetiga',
    header: 'Pihak Ketiga',
    accessorFn: (row) => row.pihakKetiga?.nama || '-',
    enableHiding: true,
  },
  {
    id: 'pptkPpk',
    header: 'PPTK/PPK',
    accessorFn: (row) => row.pptkPpk?.nama || '-',
    enableHiding: true,
  },
  {
    id: 'asalPembelian',
    header: 'Asal Pembelian',
    accessorFn: (row) => row.asalPembelian?.nama || '-',
    enableHiding: true,
  },
  {
    id: 'rekening',
    header: 'Rekening',
    accessorFn: (row) =>
      row.rekening
        ? `${row.rekening.namaPemilik} - ${row.rekening.namaBank}`
        : '-',
    cell: ({ row }) => {
      const rek = row.original.rekening;
      return rek ? (
        <div>
          <div className="font-medium">{rek.namaPemilik}</div>
          <div className="text-xs text-muted-foreground">
            {rek.namaBank} - {rek.nomorRekening}
          </div>
        </div>
      ) : (
        '-'
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.getValue('keterangan') || '-'}
      </div>
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, 'dd MMM yyyy HH:mm', { locale: localeId })}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <BastMasukActionCell item={row.original} />,
    enableHiding: false,
  },
];
