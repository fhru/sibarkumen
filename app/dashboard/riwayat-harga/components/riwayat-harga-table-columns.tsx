'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export type RiwayatHarga = {
  id: number;
  namaBarang: string | null;
  kodeBarang: string | null;
  hargaSatuan: string;
  qty: number;
  nomorBast: string | null;
  tanggalBast: Date | string | null;
  supplier: string | null;
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

export const columns: ColumnDef<RiwayatHarga>[] = [
  {
    accessorKey: 'kodeBarang',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Kode Barang"
        sortKey="barang.kodeBarang"
      />
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'namaBarang',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Nama Barang"
        sortKey="barang.nama"
      />
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'hargaSatuan',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Harga Satuan"
        sortKey="bastMasukDetail.hargaSatuan"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('hargaSatuan'));
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'qty',
    header: 'Qty',
    enableHiding: true,
  },
  {
    accessorKey: 'nomorBast',
    header: 'Nomor BAST',
    cell: ({ row }) => {
      const val = row.getValue('nomorBast') as string;
      return (
        <Link
          href={`/dashboard/bast-masuk?search=${val}`}
          className="text-blue-600 hover:underline"
        >
          {val}
        </Link>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'tanggalBast',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Tanggal BAST"
        sortKey="bastMasuk.tanggalBast"
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('tanggalBast');
      return (
        <div>
          {date
            ? format(new Date(date as string), 'dd MMMM yyyy', {
                locale: localeId,
              })
            : '-'}
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'supplier',
    header: 'Supplier',
    enableHiding: true,
  },
];
