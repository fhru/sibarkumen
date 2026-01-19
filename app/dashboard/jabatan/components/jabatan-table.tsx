'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
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
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { JabatanDialogUpdate } from './jabatan-dialog-update';
import { JabatanAlertDelete } from './jabatan-alert-delete';
import { JabatanDialogCreate } from './jabatan-dialog-create';

export type Jabatan = {
  id: number;
  nama: string;
};

interface JabatanTableProps {
  data: Jabatan[];
}

export function JabatanTable({ data }: JabatanTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [editingJabatan, setEditingJabatan] = React.useState<Jabatan | null>(
    null
  );

  const [openDelete, setOpenDelete] = React.useState(false);
  const [deletingJabatanId, setDeletingJabatanId] = React.useState<
    number | null
  >(null);

  const handleEdit = (jabatan: Jabatan) => {
    setEditingJabatan(jabatan);
    setOpenUpdate(true);
  };

  const handleDelete = (id: number) => {
    setDeletingJabatanId(id);
    setOpenDelete(true);
  };

  const columns: ColumnDef<Jabatan>[] = [
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
      cell: ({ row }) => <div className="ml-4">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'nama',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Jabatan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(item.id)}
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
    globalFilterFn: 'includesString', // Case-insensitive text search
    getRowId: (row) => row.id.toString(), // Ensure row stability
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
              placeholder="Cari jabatan..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 bg-background! dark:bg-sidebar!"
            />
          </div>
          <JabatanDialogCreate />
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

      <JabatanDialogUpdate
        open={openUpdate}
        setOpen={setOpenUpdate}
        jabatan={editingJabatan}
      />

      <JabatanAlertDelete
        open={openDelete}
        setOpen={setOpenDelete}
        jabatanId={deletingJabatanId}
      />
    </>
  );
}
