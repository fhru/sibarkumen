'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Search,
  Eye,
  Plus,
  Edit,
  SlidersHorizontal,
  ChevronDown,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { deleteBastMasuk } from '@/drizzle/actions/bast-masuk';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BastMasukFilterDialog } from './bast-masuk-filter-dialog';
import { VisibilityState } from '@tanstack/react-table';

export type BastMasuk = {
  id: number;
  nomorReferensi: string;
  nomorBast: string;
  tanggalBast: string | Date;
  nomorBapb: string;
  tanggalBapb: string | Date;
  pihakKetiga: {
    id: number;
    nama: string;
  } | null;
  pptkPpk: {
    id: number;
    nama: string;
  } | null;
  asalPembelian: {
    id: number;
    nama: string;
  } | null;
  rekening: {
    id: number;
    namaPemilik: string;
    namaBank: string;
    nomorRekening: string;
  } | null;
  keterangan: string | null;
  createdAt: Date;
};

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
      nomorReferensi: false,
      nomorBapb: false,
      tanggalBapb: false,
      pptkPpk: false,
      asalPembelian: false,
      rekening: false,
      keterangan: false,
      createdAt: false,
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

  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<BastMasuk | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = (item: BastMasuk) => {
    setSelectedItem(item);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteBastMasuk(selectedItem.id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setIsDeleting(false);
      setOpenDelete(false);
      setSelectedItem(null);
    }
  };

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

  const handleFilterChange = (key: string, value?: string | number) => {
    const params = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value.toString());
    } else {
      params.delete(key);
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

  const handleSort = (columnId: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = searchParams.get('sortBy');
    const currentOrder = searchParams.get('sortOrder');

    if (currentSort === columnId) {
      if (currentOrder === 'asc') {
        // asc -> desc
        params.set('sortOrder', 'desc');
      } else if (currentOrder === 'desc') {
        // desc -> reset (remove sort)
        params.delete('sortBy');
        params.delete('sortOrder');
      }
    } else {
      // New column, start with asc
      params.set('sortBy', columnId);
      params.set('sortOrder', 'asc');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const columns: ColumnDef<BastMasuk>[] = [
    {
      accessorKey: 'nomorBast',
      header: () => {
        const currentSort = searchParams.get('sortBy');
        const currentOrder = searchParams.get('sortOrder');
        const isActive = currentSort === 'nomorBast';

        let SortIcon = ArrowUpDown;
        if (isActive) {
          SortIcon = currentOrder === 'asc' ? ArrowUp : ArrowDown;
        }

        return (
          <Button variant="ghost" onClick={() => handleSort('nomorBast')}>
            Nomor BAST
            <SortIcon
              className={`ml-2 h-4 w-4 ${isActive ? 'text-primary' : ''}`}
            />
          </Button>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: 'nomorReferensi',
      header: 'Nomor Referensi',
      enableHiding: true,
    },
    {
      accessorKey: 'tanggalBast',
      header: () => {
        const currentSort = searchParams.get('sortBy');
        const currentOrder = searchParams.get('sortOrder');
        const isActive = currentSort === 'tanggalBast';

        let SortIcon = ArrowUpDown;
        if (isActive) {
          SortIcon = currentOrder === 'asc' ? ArrowUp : ArrowDown;
        }

        return (
          <Button variant="ghost" onClick={() => handleSort('tanggalBast')}>
            Tanggal BAST
            <SortIcon
              className={`ml-2 h-4 w-4 ${isActive ? 'text-primary' : ''}`}
            />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('tanggalBast'));
        return (
          <div>{date.toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'nomorBapb',
      header: 'Nomor BAPB',
      enableHiding: true,
    },
    {
      accessorKey: 'tanggalBapb',
      header: 'Tanggal BAPB',
      cell: ({ row }) => {
        const date = new Date(row.getValue('tanggalBapb'));
        return (
          <div>{date.toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
        );
      },
      enableHiding: true,
    },
    {
      id: 'pihakKetiga',
      header: 'Pihak Ketiga',
      accessorFn: (row) => row.pihakKetiga?.nama || '-',
      enableHiding: true,
    },
    {
      id: 'pptkPpk',
      header: 'PPTK/PPK',
      accessorFn: (row) => row.pptkPpk?.nama || '-',
      enableHiding: true,
    },
    {
      id: 'asalPembelian',
      header: 'Asal Pembelian',
      accessorFn: (row) => row.asalPembelian?.nama || '-',
      enableHiding: true,
    },
    {
      id: 'rekening',
      header: 'Rekening',
      accessorFn: (row) =>
        row.rekening
          ? `${row.rekening.namaPemilik} - ${row.rekening.namaBank}`
          : '-',
      cell: ({ row }) => {
        const rek = row.original.rekening;
        return rek ? (
          <div>
            <div className="font-medium">{rek.namaPemilik}</div>
            <div className="text-xs text-muted-foreground">
              {rek.namaBank} - {rek.nomorRekening}
            </div>
          </div>
        ) : (
          '-'
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.getValue('keterangan') || '-'}
        </div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, 'dd MMM yyyy HH:mm', { locale: localeId })}
          </div>
        );
      },
      enableHiding: true,
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/bast-masuk/${item.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/bast-masuk/${item.id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDeleteClick(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
    },
  ];

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
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative w-full max-w-[250px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                defaultValue={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="pl-8 bg-background dark:bg-sidebar"
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
              <DropdownMenuContent align="center" className="w-40">
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

            <Button onClick={() => router.push('/dashboard/bast-masuk/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Buat BAST Masuk
            </Button>
          </div>
        </div>

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
                    Data tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {data.length} dari {totalItems} data
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
            <div className="text-sm">
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

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menghapus BAST Masuk akan
              mengembalikan stok barang sesuai dengan jumlah yang diterima.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              variant={'destructive'}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
