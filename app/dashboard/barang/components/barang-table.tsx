'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  PackageOpen,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { BarangFilterDialog } from './barang-filter-dialog';
import { columns, Barang } from './barang-table-columns';
import { createContext, useContext } from 'react';

interface BarangTableContextType {
  kategoriList: { id: number; nama: string }[];
  satuanList: { id: number; nama: string }[];
}

const BarangTableContext = createContext<BarangTableContextType | null>(null);

export function useBarangTableContext() {
  const context = useContext(BarangTableContext);
  if (!context) {
    throw new Error(
      'useBarangTableContext must be used within a BarangTableProvider'
    );
  }
  return context;
}

import { authClient } from '@/lib/auth-client';
import { Role } from '@/config/nav-items';

const BarangTableProvider = BarangTableContext.Provider;

interface DataTableProps {
  data: Barang[];
  pageCount: number;
  kategoriList: { id: number; nama: string }[];
  satuanList: { id: number; nama: string }[];
  totalItems: number;
}

export function BarangTable({
  data,
  pageCount,
  kategoriList,
  satuanList,
  totalItems,
}: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      spesifikasi: false,
      updatedAt: false,
    });

  // Search state managed via URL
  const search = searchParams.get('search')?.toString() || '';
  const page = Number(searchParams.get('page')) || 1;
  const categoriesParam = searchParams.get('categories');
  const statusParam = searchParams.get('status');

  const selectedCategories = React.useMemo(() => {
    return categoriesParam ? categoriesParam.split(',') : [];
  }, [categoriesParam]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleApplyFilters = (
    status: string | undefined,
    categories: string[]
  ) => {
    const params = new URLSearchParams(searchParams);

    // Handle Status
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    // Handle Categories
    if (categories.length > 0) {
      params.set('categories', categories.join(','));
    } else {
      params.delete('categories');
    }

    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('categories');
    params.delete('status');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isFiltered =
    search !== '' || selectedCategories.length > 0 || !!statusParam;

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: page - 1,
        pageSize: 50,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.id.toString(),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const categoryOptions = React.useMemo(() => {
    return kategoriList.map((k) => ({
      label: k.nama,
      value: k.id.toString(),
    }));
  }, [kategoriList]);

  return (
    <BarangTableProvider value={{ kategoriList, satuanList }}>
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                defaultValue={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="pl-8 bg-background dark:bg-input/30"
              />
            </div>

            <BarangFilterDialog
              statusValue={statusParam || undefined}
              selectedCategories={selectedCategories}
              categoryOptions={categoryOptions}
              onApplyFilters={handleApplyFilters}
            />

            {isFiltered && (
              <Button variant="ghost" size={'icon'} onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Kolom
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                table.getRowModel().rows.map((row, index) => (
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

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {table.getRowModel().rows.length} data dari {totalItems}{' '}
            data
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!table.getCanPreviousPage() || isPending}
            >
              {isPending ? '...' : 'Previous'}
            </Button>
            <div className="text-sm text-muted-foreground">
              Halaman {page} dari {pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!table.getCanNextPage() || isPending}
            >
              {isPending ? '...' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </BarangTableProvider>
  );
}
