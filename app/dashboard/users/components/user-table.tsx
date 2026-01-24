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
  Shield,
  Ban,
  Trash2,
  Search,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserDialogBan } from "./user-dialog-ban";
import { UserAlertDelete } from "./user-alert-delete";
import { UserDialogEdit } from "./user-dialog-edit";
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: Date;
};

interface UserTableProps {
  data: User[];
}

export function UserTable({ data }: UserTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [openEdit, setOpenEdit] = React.useState(false);
  const [openBan, setOpenBan] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleEditComp = (user: User) => {
    setSelectedUser(user);
    setOpenEdit(true);
  };

  const handleBanComp = (user: User) => {
    setSelectedUser(user);
    setOpenBan(true);
  };

  const handleDeleteComp = (user: User) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {(role || "user").charAt(0).toUpperCase() +
              (role || "user").slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const isBanned = row.original.banned;
        return isBanned ? (
          <Badge
            variant="destructive"
            className="flex w-fit items-center gap-1"
          >
            <Ban className="h-3 w-3" /> Banned
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="flex w-fit items-center gap-1 text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-900 dark:bg-green-900/30"
          >
            <CheckCircle className="h-3 w-3" /> Aktif
          </Badge>
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
              <DropdownMenuItem onClick={() => handleEditComp(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBanComp(item)}>
                <Ban className="mr-2 h-4 w-4" />
                {item.banned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDeleteComp(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus User
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
    getRowId: (row) => row.id,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
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
                placeholder="Cari user..."
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

      <UserDialogEdit
        open={openEdit}
        setOpen={setOpenEdit}
        user={selectedUser as any} // Cast safely as we know structure matches
      />

      <UserDialogBan open={openBan} setOpen={setOpenBan} user={selectedUser} />

      <UserAlertDelete
        open={openDelete}
        setOpen={setOpenDelete}
        userId={selectedUser?.id || null}
      />
    </>
  );
}
