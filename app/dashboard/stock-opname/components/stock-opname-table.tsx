'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
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
import { Badge } from '@/components/ui/badge';
import { Search, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { StockOpnameFilterDialog } from './stock-opname-filter-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StockOpnameTableProps {
  data: any[];
  pageCount: number;
  totalItems: number;
  petugasList: { id: number; nama: string }[];
}

export function StockOpnameTable({
  data,
  pageCount,
  totalItems,
  petugasList,
}: StockOpnameTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL Params
  const search = searchParams.get('search')?.toString() || '';
  const page = Number(searchParams.get('page')) || 1;
  const statusParam = searchParams.get('status');
  const petugasParam = searchParams.get('petugas');

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
    petugasId: string | undefined
  ) => {
    const params = new URLSearchParams(searchParams);
    if (status) params.set('status', status);
    else params.delete('status');

    if (petugasId) params.set('petugas', petugasId);
    else params.delete('petugas');

    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.delete('status');
    params.delete('petugas');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const isFiltered = search !== '' || !!statusParam || !!petugasParam;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor SO..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 bg-background dark:bg-input/30"
            />
          </div>
          <StockOpnameFilterDialog
            statusValue={statusParam || undefined}
            petugasValue={petugasParam || undefined}
            petugasList={petugasList}
            onApplyFilters={handleApplyFilters}
          />
          {isFiltered && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background dark:bg-input/30">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-[100px] text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              data.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.nomor}</TableCell>
                  <TableCell>
                    {format(new Date(session.tanggal), 'dd MMMM yyyy', {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{session.petugas?.nama || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === 'COMPLETED'
                          ? 'default'
                          : session.status === 'DRAFT'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{session.keterangan || '-'}</TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Link
                              href={`/dashboard/stock-opname/${session.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lihat Detail</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {data.length} data dari {totalItems} data
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isPending}
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
            disabled={page >= pageCount || isPending}
          >
            {isPending ? '...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
