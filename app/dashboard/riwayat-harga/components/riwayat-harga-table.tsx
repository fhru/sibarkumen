'use client';

import { useDebouncedCallback } from 'use-debounce';
import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  VisibilityState,
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
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { RiwayatHargaFilterDialog } from './riwayat-harga-filter-dialog';
import { columns, RiwayatHarga } from './riwayat-harga-table-columns';

interface RiwayatHargaTableProps {
  data: RiwayatHarga[];
  pageCount: number;
  totalItems: number;
}

export function RiwayatHargaTable({
  data,
  pageCount,
  totalItems,
}: RiwayatHargaTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      kodeBarang: true,
      qty: true,
      nomorBast: true,
      supplier: true,
    });

  // Read current state from URL
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const pihakKetigaId = searchParams.get('pihakKetiga')
    ? Number(searchParams.get('pihakKetiga'))
    : undefined;
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : undefined;
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : undefined;

  const initialPihakKetiga = undefined;

  // Debounced search handler
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 300);

  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const formatDateForURL = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: page - 1,
        pageSize: 25,
      },
    },
  });

  const isFiltered =
    search !== '' ||
    startDate !== undefined ||
    endDate !== undefined ||
    pihakKetigaId !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari Barang..."
              defaultValue={search}
              onChange={(event) => handleSearch(event.target.value)}
              className="pl-8 bg-background dark:bg-input/30"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => {
                  handleSearch('');
                  const input = document.querySelector(
                    'input[placeholder="Cari Barang..."]'
                  ) as HTMLInputElement;
                  if (input) input.value = '';
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <RiwayatHargaFilterDialog
            startDate={startDate}
            endDate={endDate}
            selectedPihakKetiga={pihakKetigaId}
            initialPihakKetiga={initialPihakKetiga}
            onApplyFilters={(filters) => {
              const params = new URLSearchParams(searchParams);

              if (filters.startDate) {
                params.set('startDate', formatDateForURL(filters.startDate));
              } else {
                params.delete('startDate');
              }

              if (filters.endDate) {
                params.set('endDate', formatDateForURL(filters.endDate));
              } else {
                params.delete('endDate');
              }

              if (filters.pihakKetiga) {
                params.set('pihakKetiga', filters.pihakKetiga.toString());
              } else {
                params.delete('pihakKetiga');
              }

              params.set('page', '1');
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            onClearFilters={clearFilters}
            hasActiveFilters={isFiltered}
          />

          {isFiltered && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Reset Filter</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto bg-background dark:bg-input/30"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
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
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="font-medium">Data tidak ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {data.length} dari {totalItems.toLocaleString('id-ID')}{' '}
          data
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page - 1).toString());
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            disabled={page <= 1 || isPending}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Halaman {page} dari {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page + 1).toString());
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            disabled={page >= pageCount || isPending}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

