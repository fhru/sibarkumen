"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { BastKeluar, createColumns } from "./bast-keluar-table-columns";
import { BastKeluarFilterDialog } from "./bast-keluar-filter-dialog";

interface BastKeluarTableProps {
  data: BastKeluar[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function BastKeluarTable({ data, pagination }: BastKeluarTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      pihakPertama: false,
    });

  // Get current page and filters from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentIsPrinted = searchParams.get("isPrinted") || undefined;
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : undefined;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : undefined;
  const currentSortBy = searchParams.get("sortBy") || "";
  const currentSortOrder = searchParams.get("sortOrder") || "";

  // Debounced search handler
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 300);

  const formatDateForURL = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleApplyFilters = (filters: {
    isPrinted: string | undefined;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const params = new URLSearchParams(searchParams);

    if (filters.isPrinted) {
      params.set("isPrinted", filters.isPrinted);
    } else {
      params.delete("isPrinted");
    }

    if (filters.startDate) {
      params.set("startDate", formatDateForURL(filters.startDate));
    } else {
      params.delete("startDate");
    }

    if (filters.endDate) {
      params.set("endDate", formatDateForURL(filters.endDate));
    } else {
      params.delete("endDate");
    }

    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Sort handler (tri-state)
  const handleSort = (columnId: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder");

    if (currentSort === columnId) {
      if (currentOrder === "asc") {
        params.set("sortOrder", "desc");
      } else if (currentOrder === "desc") {
        params.delete("sortBy");
        params.delete("sortOrder");
      }
    } else {
      params.set("sortBy", columnId);
      params.set("sortOrder", "asc");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const columns = React.useMemo(
    () => createColumns(currentSortBy, currentSortOrder, handleSort),
    [currentSortBy, currentSortOrder],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor BAST..."
              defaultValue={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 bg-background dark:bg-input/30"
            />
            {currentSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => {
                  handleSearch("");
                  const input = document.querySelector(
                    'input[placeholder*="Cari"]',
                  ) as HTMLInputElement;
                  if (input) input.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <BastKeluarFilterDialog
            isPrintedValue={currentIsPrinted}
            startDate={startDate}
            endDate={endDate}
            onApplyFilters={handleApplyFilters}
          />

          {(currentIsPrinted || startDate || endDate) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() =>
                handleApplyFilters({
                  isPrinted: undefined,
                  startDate: undefined,
                  endDate: undefined,
                })
              }
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Reset Filter</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto bg-background dark:bg-input/30"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
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
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {data.length} dari{" "}
          {pagination.total.toLocaleString("id-ID")} data
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(currentPage - 1));
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            disabled={currentPage <= 1 || isPending}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(currentPage + 1));
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            disabled={currentPage >= pagination.totalPages || isPending}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
