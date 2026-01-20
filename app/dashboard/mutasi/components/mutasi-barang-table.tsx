'use client';

import * as React from 'react';
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { MutasiDetailDialog } from './mutasi-detail-dialog';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type MutasiBarang = {
  id: number;
  barangId: number;
  tanggal: Date;
  jenisMutasi: 'MASUK' | 'KELUAR' | 'PENYESUAIAN';
  qtyMasuk: number;
  qtyKeluar: number;
  stokAkhir: number;
  referensiId: string | null;
  sumberTransaksi: string | null;
  keterangan: string | null;
  barang: {
    id: number;
    nama: string;
    kodeBarang: string;
  };
};

interface MutasiBarangTableProps {
  data: MutasiBarang[];
  pageCount: number;
  totalItems: number;
}

export function MutasiBarangTable({
  data,
  pageCount,
  totalItems,
}: MutasiBarangTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedMutasi, setSelectedMutasi] =
    React.useState<MutasiBarang | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      referensiId: false,
      sumberTransaksi: false,
      keterangan: false,
    });

  // Get current page and filters from URL
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentJenisMutasi = searchParams.get('jenisMutasi') || 'all';
  const currentSortBy = searchParams.get('sortBy') || '';
  const currentSortOrder = searchParams.get('sortOrder') || '';

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

  // Filter change handler
  const handleFilterChange = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Sort handler (tri-state)
  const handleSort = (columnId: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = searchParams.get('sortBy');
    const currentOrder = searchParams.get('sortOrder');

    if (currentSort === columnId) {
      if (currentOrder === 'asc') {
        params.set('sortOrder', 'desc');
      } else if (currentOrder === 'desc') {
        params.delete('sortBy');
        params.delete('sortOrder');
      }
    } else {
      params.set('sortBy', columnId);
      params.set('sortOrder', 'asc');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Get sort icon
  const getSortIcon = (columnId: string) => {
    if (currentSortBy !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (currentSortOrder === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const columns: ColumnDef<MutasiBarang>[] = [
    {
      accessorKey: 'tanggal',
      header: () => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('tanggal')}
            className="h-8 px-2"
          >
            Tanggal
            {getSortIcon('tanggal')}
          </Button>
        );
      },
      cell: ({ row }) => {
        return format(new Date(row.getValue('tanggal')), 'dd MMM yyyy HH:mm', {
          locale: localeId,
        });
      },
    },
    {
      id: 'barang',
      accessorFn: (row) => row.barang.nama,
      header: () => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort('barang')}
            className="h-8 px-2"
          >
            Barang
            {getSortIcon('barang')}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium">{row.original.barang.nama}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.barang.kodeBarang}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'jenisMutasi',
      header: 'Jenis',
      cell: ({ row }) => {
        const jenis = row.getValue('jenisMutasi') as string;
        const variant =
          jenis === 'MASUK'
            ? 'default'
            : jenis === 'KELUAR'
              ? 'destructive'
              : 'secondary';
        return <Badge variant={variant}>{jenis}</Badge>;
      },
    },
    {
      accessorKey: 'qtyMasuk',
      header: 'Qty Masuk',
      cell: ({ row }) => {
        const qty = row.getValue('qtyMasuk') as number;
        return qty > 0 ? (
          <span className="text-green-600 font-medium">+{qty}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'qtyKeluar',
      header: 'Qty Keluar',
      cell: ({ row }) => {
        const qty = row.getValue('qtyKeluar') as number;
        return qty > 0 ? (
          <span className="text-destructive font-medium">-{qty}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'stokAkhir',
      header: 'Stok Akhir',
      cell: ({ row }) => {
        const stok = row.getValue('stokAkhir') as number;
        return (
          <span className={stok < 0 ? 'text-red-600 font-bold' : ''}>
            {stok.toLocaleString('id-ID')}
          </span>
        );
      },
    },
    {
      accessorKey: 'referensiId',
      header: 'Referensi',
      cell: ({ row }) => {
        return row.getValue('referensiId') || '-';
      },
    },
    {
      accessorKey: 'sumberTransaksi',
      header: 'Sumber',
      cell: ({ row }) => {
        const sumber = row.getValue('sumberTransaksi') as string | null;
        return sumber ? (
          <span className="text-xs">{sumber.replace(/_/g, ' ')}</span>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
      cell: ({ row }) => {
        const keterangan = row.getValue('keterangan') as string | null;
        return keterangan ? <span className="text-xs">{keterangan}</span> : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedMutasi(row.original);
              setDetailOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pageCount,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari barang, kode, atau referensi..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 bg-background dark:bg-sidebar"
          />
          {currentSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => {
                handleSearch('');
                const input = document.querySelector(
                  'input[placeholder*="Cari"]'
                ) as HTMLInputElement;
                if (input) input.value = '';
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select
          value={currentJenisMutasi}
          onValueChange={(value) => handleFilterChange('jenisMutasi', value)}
        >
          <SelectTrigger className="w-[180px] bg-background dark:bg-sidebar">
            <SelectValue placeholder="Jenis Mutasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="MASUK">Masuk</SelectItem>
            <SelectItem value="KELUAR">Keluar</SelectItem>
            <SelectItem value="PENYESUAIAN">Penyesuaian</SelectItem>
          </SelectContent>
        </Select>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Kolom <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
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

      {/* Table */}
      <div className="rounded-md border bg-background dark:bg-sidebar">
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
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
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
              params.set('page', String(currentPage - 1));
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            disabled={currentPage <= 1 || isPending}
          >
            Previous
          </Button>
          <div className="text-sm">
            Halaman {currentPage} dari {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(currentPage + 1));
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
              });
            }}
            disabled={currentPage >= pageCount || isPending}
          >
            Next
          </Button>
        </div>
      </div>

      {selectedMutasi && (
        <MutasiDetailDialog
          mutasi={selectedMutasi}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
