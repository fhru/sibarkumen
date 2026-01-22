'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  History,
  Eye,
  Copy,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarangDialogUpdate } from './barang-dialog-update';
import { BarangDialogDetail } from './barang-dialog-detail';
import { BarangAlertDelete } from './barang-alert-delete';
import { useBarangTableContext } from './barang-table';

const BarangActionCell = ({ barang }: { barang: Barang }) => {
  const { kategoriList, satuanList } = useBarangTableContext();
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleViewMutasi = () => {
    router.push(`/dashboard/mutasi?search=${encodeURIComponent(barang.nama)}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setShowDetailDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleViewMutasi}>
            <History className="mr-2 h-4 w-4" />
            Lihat Mutasi
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BarangDialogUpdate
        key={`update-${barang.id}`}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        barang={barang}
        kategoriList={kategoriList}
        satuanList={satuanList}
      />

      <BarangDialogDetail
        key={`detail-${barang.id}`}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        barang={barang}
      />

      <BarangAlertDelete
        key={`delete-${barang.id}`}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        barangId={barang.id}
        barangNama={barang.nama}
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

  const currentSort = searchParams.get('sort');
  const currentOrder = searchParams.get('order');

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSort === sortKey) {
      if (currentOrder === 'asc') {
        params.set('order', 'desc');
      } else if (currentOrder === 'desc') {
        params.delete('sort');
        params.delete('order');
      }
    } else {
      params.set('sort', sortKey);
      params.set('order', 'asc');
    }

    router.replace(`?${params.toString()}`);
  };

  // Logic untuk menentukan Icon yang tampil
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

export type Barang = {
  id: number;
  nama: string;
  kodeBarang: string;
  stok: number;
  spesifikasi: string | null;
  kategori: string | null;
  satuan: string | null;
  kategoriId: number | null;
  satuanId: number | null;
  updatedAt: Date;
};

export const columns: ColumnDef<Barang>[] = [
  {
    accessorKey: 'kodeBarang',
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Kode Barang"
        sortKey="kodeBarang"
      />
    ),
  },
  {
    accessorKey: 'nama',
    header: ({ column }) => (
      <SortableHeader column={column} title="Nama Barang" sortKey="nama" />
    ),
  },
  {
    accessorKey: 'kategori',
    header: 'Kategori',
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue('kategori') || '-'}</Badge>;
    },
  },
  {
    accessorKey: 'stok',
    header: ({ column }) => (
      <SortableHeader column={column} title="Stok" sortKey="stok" />
    ),
    cell: ({ row }) => {
      const stok = parseInt(row.getValue('stok'));
      let textColor = '';
      if (stok === 0) {
        textColor = 'text-destructive';
      } else if (stok < 10) {
        textColor = 'text-yellow-500';
      }

      return (
        <div className={`font-medium ${textColor}`}>
          {stok} {row.original.satuan}
        </div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Terakhir Update',
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleDateString('id-ID');
    },
  },
  {
    accessorKey: 'spesifikasi',
    header: 'Spesifikasi',
    cell: ({ row }) => {
      return (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue('spesifikasi') || ''}
        >
          {row.getValue('spesifikasi') || '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <BarangActionCell barang={row.original} />,
  },
];
