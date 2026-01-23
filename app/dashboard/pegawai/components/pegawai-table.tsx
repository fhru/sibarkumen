"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ArrowUpDown,
  Pencil,
  Trash2,
  Search,
  Briefcase,
} from "lucide-react";
import { PegawaiDialogUpdate } from "./pegawai-dialog-update";
import { PegawaiAlertDelete } from "./pegawai-alert-delete";
import { PegawaiJabatanManager } from "./pegawai-jabatan-manager"; // Import Manager
import { Badge } from "@/components/ui/badge";

export type Pegawai = {
  id: number;
  nama: string;
  nip: string | null;
  userId: string | null;
  pegawaiJabatan: {
    id: number;
    isAktif: boolean;
    jabatan: {
      id: number;
      nama: string;
    };
  }[];
};

interface PegawaiTableProps {
  data: Pegawai[];
  jabatanList: { id: number; nama: string }[]; // Pass jabatan list for the manager
}

export function PegawaiTable({ data, jabatanList }: PegawaiTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [editingPegawai, setEditingPegawai] = React.useState<Pegawai | null>(
    null,
  );

  const [openDelete, setOpenDelete] = React.useState(false);
  const [deletingPegawaiId, setDeletingPegawaiId] = React.useState<
    number | null
  >(null);

  // Jabatan Manager State
  const [openJabatanManager, setOpenJabatanManager] = React.useState(false);
  const [managingPegawaiId, setManagingPegawaiId] = React.useState<
    number | null
  >(null);

  const managingPegawai = React.useMemo(() => {
    return data.find((p) => p.id === managingPegawaiId) || null;
  }, [data, managingPegawaiId]);

  const handleEdit = (pegawai: Pegawai) => {
    setEditingPegawai(pegawai);
    setOpenUpdate(true);
  };

  const handleDelete = (id: number) => {
    setDeletingPegawaiId(id);
    setOpenDelete(true);
  };

  const handleManageJabatan = (pegawai: Pegawai) => {
    setManagingPegawaiId(pegawai.id);
    setOpenJabatanManager(true);
  };

  const columns: ColumnDef<Pegawai>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="ml-4">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "nama",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Pegawai
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "nip",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            NIP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("nip");
        return value ? value : <span className="text-muted-foreground">-</span>;
      },
    },
    {
      id: "jabatan",
      header: "Jabatan Aktif",
      cell: ({ row }) => {
        const activePositions = row.original.pegawaiJabatan.filter(
          (pj) => pj.isAktif,
        );
        return (
          <div className="flex flex-wrap gap-1">
            {activePositions.length > 0 ? (
              activePositions.map((pj) => (
                <Badge key={pj.id} variant="secondary" className="text-xs">
                  {pj.jabatan.nama}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
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
              <DropdownMenuItem onClick={() => handleManageJabatan(item)}>
                <Briefcase className="mr-2 h-4 w-4" />
                Atur Jabatan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Pegawai
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Pegawai
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
    globalFilterFn: "includesString", // Case-insensitive text search
    getRowId: (row) => row.id.toString(), // Ensure row stability
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pegawai..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 bg-background dark:bg-input/30"
              />
            </div>
          </div>
        </div>
        <div className="rounded-md border bg-background dark:bg-input/30">
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
                              header.getContext(),
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
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {table.getRowModel().rows.length} data
          </div>
          <div className="flex items-center space-x-2">
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
      </div>

      <PegawaiDialogUpdate
        open={openUpdate}
        setOpen={setOpenUpdate}
        pegawai={editingPegawai}
      />

      <PegawaiAlertDelete
        open={openDelete}
        setOpen={setOpenDelete}
        pegawaiId={deletingPegawaiId}
      />

      {/* Jabatan Manager Dialog */}
      <PegawaiJabatanManager
        open={openJabatanManager}
        setOpen={setOpenJabatanManager}
        pegawai={managingPegawai}
        jabatanList={jabatanList}
      />
    </>
  );
}
