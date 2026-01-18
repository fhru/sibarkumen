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
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  BoxIcon,
  PackageOpen,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { BarangDialogCreate } from './barang-dialog-create';
import { BarangFacetedFilter } from './barang-filter-faceted';
import { BarangStatusFilter } from './barang-filter-status';

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

  const handleCategoryFilter = (values: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (values.length > 0) {
      params.set('categories', values.join(','));
    } else {
      params.delete('categories');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusFilter = (value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('categories');
    params.delete('status');
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
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
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-[250px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                defaultValue={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="pl-8"
              />
            </div>

            <BarangStatusFilter
              value={statusParam || undefined}
              onChange={handleStatusFilter}
            />

            <BarangFacetedFilter
              title="Kategori"
              options={categoryOptions}
              selectedValues={selectedCategories}
              setFilterValue={handleCategoryFilter}
            />

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
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
            <BarangDialogCreate
              kategoriList={kategoriList}
              satuanList={satuanList}
            />
          </div>
        </div>

        {/* Table */}
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
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
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
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-[200px] text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex p-4 items-center justify-center rounded-full bg-muted">
                        <PackageOpen className="h-10 w-10 text-muted-foreground" />
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">Barang Tidak Ditemukan</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={!table.getCanPreviousPage() || isPending}
          >
            {isPending ? '...' : 'Previous'}
          </Button>
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {totalItems} entries
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
    </BarangTableProvider>
  );
}
