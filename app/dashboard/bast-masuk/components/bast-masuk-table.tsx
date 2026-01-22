'use client';

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
import { BastMasukFilterDialog } from './bast-masuk-filter-dialog';
import { columns, BastMasuk } from './bast-masuk-table-columns';

interface BastMasukTableProps {
  data: BastMasuk[];
  pageCount: number;
  totalItems: number;
}

export function BastMasukTable({
  data,
  pageCount,
  totalItems,
}: BastMasukTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      nomorBapb: false,
      tanggalBapb: false,
      pptkPpk: false,
      rekening: false,
      keterangan: false,
      createdAt: false,
      asalPembelian: false,
    });

  // Read current state from URL
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const pihakKetigaId = searchParams.get('pihakKetiga')
    ? Number(searchParams.get('pihakKetiga'))
    : undefined;
  const pptkPpkId = searchParams.get('pptk')
    ? Number(searchParams.get('pptk'))
    : undefined;
  const asalPembelianId = searchParams.get('asalPembelian')
    ? Number(searchParams.get('asalPembelian'))
    : undefined;
  const rekeningId = searchParams.get('rekening')
    ? Number(searchParams.get('rekening'))
    : undefined;
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : undefined;
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : undefined;

  // Get unique options for non-async filters
  const asalPembelianOptions = React.useMemo(() => {
    const unique = new Map();
    data.forEach((item) => {
      if (item.asalPembelian) {
        unique.set(item.asalPembelian.id, item.asalPembelian.nama);
      }
    });
    return Array.from(unique.entries()).map(([id, nama]) => ({
      id: id.toString(),
      nama,
    }));
  }, [data]);

  const rekeningOptions = React.useMemo(() => {
    const unique = new Map();
    data.forEach((item) => {
      if (item.rekening) {
        unique.set(
          item.rekening.id,
          `${item.rekening.namaPemilik} - ${item.rekening.namaBank} (${item.rekening.nomorRekening})`
        );
      }
    });
    return Array.from(unique.entries()).map(([id, nama]) => ({
      id: id.toString(),
      nama,
    }));
  }, [data]);

  // Get initial options for AsyncSelect from current data
  const initialPihakKetiga = React.useMemo(() => {
    if (!pihakKetigaId) return undefined;
    const item = data.find((d) => d.pihakKetiga?.id === pihakKetigaId);
    return item?.pihakKetiga
      ? { id: item.pihakKetiga.id, nama: item.pihakKetiga.nama }
      : undefined;
  }, [data, pihakKetigaId]);

  const initialPptk = React.useMemo(() => {
    if (!pptkPpkId) return undefined;
    const item = data.find((d) => d.pptkPpk?.id === pptkPpkId);
    return item?.pptkPpk
      ? { id: item.pptkPpk.id, nama: item.pptkPpk.nama }
      : undefined;
  }, [data, pptkPpkId]);

  // URL update handlers
  const handleSearch = (term: string) => {
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
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Helper to format date for URL without timezone issues
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
        pageSize: 50,
      },
    },
  });

  const isFiltered =
    search !== '' ||
    startDate !== undefined ||
    endDate !== undefined ||
    pihakKetigaId !== undefined ||
    pptkPpkId !== undefined ||
    asalPembelianId !== undefined ||
    rekeningId !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari BAST..."
              defaultValue={search}
              onChange={(event) => handleSearch(event.target.value)}
              className="pl-8 bg-background dark:bg-input/30"
            />
          </div>

          {/* Integrated Filter Dialog */}
          <BastMasukFilterDialog
            startDate={startDate}
            endDate={endDate}
            selectedPihakKetiga={pihakKetigaId}
            selectedPptk={pptkPpkId}
            selectedAsalPembelian={
              asalPembelianId ? asalPembelianId.toString() : undefined
            }
            selectedRekening={rekeningId ? rekeningId.toString() : undefined}
            initialPihakKetiga={initialPihakKetiga}
            initialPptk={initialPptk}
            asalPembelianOptions={asalPembelianOptions}
            rekeningOptions={rekeningOptions}
            onApplyFilters={(filters) => {
              const params = new URLSearchParams(searchParams);

              // Apply all filters at once
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

              if (filters.pptk) {
                params.set('pptk', filters.pptk.toString());
              } else {
                params.delete('pptk');
              }

              if (filters.asalPembelian) {
                params.set('asalPembelian', filters.asalPembelian);
              } else {
                params.delete('asalPembelian');
              }

              if (filters.rekening) {
                params.set('rekening', filters.rekening);
              } else {
                params.delete('rekening');
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
            <Button variant="ghost" size={'icon'} onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={index === 0 ? 'ps-4' : ''}
                    >
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
                  className="h-[200px] text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium">Data tidak ditemukan.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {data.length} dari {totalItems} data
        </div>
        <div className="flex items-center gap-2">
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
