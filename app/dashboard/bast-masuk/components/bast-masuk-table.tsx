'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  Search,
  Eye,
  Plus,
  Edit,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteBastMasuk } from '@/drizzle/actions/bast-masuk';
import { toast } from 'sonner';
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

export type BastMasuk = {
  id: number;
  nomorBast: string;
  tanggalBast: string | Date;
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
  keterangan: string | null;
  createdAt: Date;
};

interface BastMasukTableProps {
  data: BastMasuk[];
}

export function BastMasukTable({ data }: BastMasukTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<BastMasuk | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (item: BastMasuk) => {
    setSelectedItem(item);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteBastMasuk(selectedItem.id);
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
      setOpenDelete(false);
      setSelectedItem(null);
    }
  };

  const columns: ColumnDef<BastMasuk>[] = [
    {
      accessorKey: 'nomorBast',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nomor BAST
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'tanggalBast',
      header: 'Tanggal BAST',
      cell: ({ row }) => {
        const date = new Date(row.getValue('tanggalBast'));
        return (
          <div>{date.toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
        );
      },
    },
    {
      id: 'pihakKetiga',
      header: 'Pihak Ketiga',
      accessorFn: (row) => row.pihakKetiga?.nama || '-',
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.getValue('keterangan') || '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
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
                onClick={() =>
                  router.push(`/dashboard/bast-masuk/${item.id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDeleteClick(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 bg-background! dark:bg-sidebar!"
            />
          </div>
          <Button onClick={() => router.push('/dashboard/bast-masuk/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Buat BAST Masuk
          </Button>
        </div>

        <div className="rounded-md border bg-background! dark:bg-sidebar!">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Data tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
