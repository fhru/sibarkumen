'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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
  Pencil,
  Search,
  Trash,
  ArrowUpDown,
} from 'lucide-react';
import { KategoriDialogCreate } from './kategori-dialog-create';
import { KategoriDialogUpdate } from './kategori-dialog-update';
import { KategoriAlertDelete } from './kategori-alert-delete';

interface Kategori {
  id: number;
  nama: string;
}

interface KategoriTableProps {
  data: Kategori[];
}

export function KategoriTable({ data }: KategoriTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // State for Update Dialog
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [editingKategori, setEditingKategori] = React.useState<Kategori | null>(
    null
  );

  // State for Delete Dialog
  const [openDelete, setOpenDelete] = React.useState(false);
  const [deletingKategoriId, setDeletingKategoriId] = React.useState<
    number | null
  >(null);

  const handleEdit = (kategori: Kategori) => {
    setEditingKategori(kategori);
    setOpenUpdate(true);
  };

  const handleDelete = (id: number) => {
    setDeletingKategoriId(id);
    setOpenDelete(true);
  };

  const columns: ColumnDef<Kategori>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-[50px] ml-4">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'nama',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Kategori
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          kategori={row.original}
          onEdit={() => handleEdit(row.original)}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id.toString(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between relative">
        <Search className="absolute h-4 w-4 text-muted-foreground left-2 top-2.5" />
        <Input
          placeholder="Cari kategori..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm pl-8 bg-background dark:bg-sidebar"
        />
        <KategoriDialogCreate />
      </div>
      <div className="rounded-md border bg-card">
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

      {editingKategori && (
        <KategoriDialogUpdate
          open={openUpdate}
          setOpen={setOpenUpdate}
          kategori={editingKategori}
        />
      )}

      {deletingKategoriId !== null && (
        <KategoriAlertDelete
          open={openDelete}
          setOpen={setOpenDelete}
          kategoriId={deletingKategoriId}
        />
      )}
    </div>
  );
}

function ActionCell({
  kategori,
  onEdit,
  onDelete,
}: {
  kategori: Kategori;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} variant="destructive">
          <Trash className="mr-2 h-4 w-4" /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
