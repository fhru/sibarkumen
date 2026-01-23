'use client';

import {
  finalizeStockOpname,
  updateStockOpnameItem,
} from '@/drizzle/actions/stock-opname';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, CheckCircle, Search } from 'lucide-react';
import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { stockOpnameItemSchema } from '@/lib/zod/stock-opname-schema';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StockOpnameDetailClientProps {
  data: any; // Type accurately if possible, but 'any' from db query result is complex to type without shared types
}

export function StockOpnameDetailClient({
  data,
}: StockOpnameDetailClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const isDraft = data.status === 'DRAFT';

  // Client-side filtering
  const filteredItems = useMemo(() => {
    if (!searchQuery) return data.items;
    const lowerQuery = searchQuery.toLowerCase();
    return data.items.filter(
      (item: any) =>
        item.barang.nama.toLowerCase().includes(lowerQuery) ||
        item.barang.kodeBarang.toLowerCase().includes(lowerQuery)
    );
  }, [data.items, searchQuery]);

  const handleFinalize = async () => {
    startTransition(async () => {
      const result = await finalizeStockOpname(data.id);
      if (result.success) {
        toast.success('Stock Opname selesai.');
        router.push('/dashboard/stock-opname');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/transaksi-masuk">
              Inventaris
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/stock-opname">
              Stock Opname
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.nomor}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Detail Stock Opname
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold">Nomor:</span> {data.nomor}
            </div>
            <div>
              <span className="font-semibold">Tanggal:</span>{' '}
              {format(new Date(data.tanggal), 'dd MMMM yyyy', { locale: id })}
            </div>
            <div>
              <span className="font-semibold">Petugas:</span>{' '}
              {data.petugas?.nama || '-'}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <Badge
                variant={
                  data.status === 'COMPLETED'
                    ? 'default'
                    : data.status === 'DRAFT'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {data.status}
              </Badge>
            </div>
          </div>
          {data.keterangan && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold">Keterangan:</span>{' '}
              {data.keterangan}
            </p>
          )}
        </div>

        {isDraft && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Finalisasi Stock Opname
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Finalisasi</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menyelesaikan Stock Opname ini? Stok
                  barang akan disesuaikan otomatis dengan stok fisik yang Anda
                  input. Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleFinalize}>
                  Ya, Finalisasi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* 3. Search & Table */}
      <div className="space-y-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="rounded-lg border bg-background dark:bg-input/30 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Stok Sistem</TableHead>
                {isDraft && (
                  <TableHead className="w-[120px] text-right">
                    Stok Fisik
                  </TableHead>
                )}
                {!isDraft && (
                  <TableHead className="text-right">Stok Fisik</TableHead>
                )}
                <TableHead className="text-right">Selisih</TableHead>
                <TableHead>Keterangan Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Item tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item: any, index: number) => (
                  <StockOpnameItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    isDraft={isDraft}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StockOpnameItemRow({
  item,
  index,
  isDraft,
}: {
  item: any;
  index: number;
  isDraft: boolean;
}) {
  const [stokFisik, setStokFisik] = useState(item.stokFisik);
  const [keterangan, setKeterangan] = useState(item.keterangan || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if prop changes (optimistic updates from parent revalidation)
  // Actually, revalidation might reset state if we don't sync.
  // But since we control the inputs, we should be careful.
  // For simplicity: init state from props, but onBlur -> save -> revalidate -> props update -> sync?
  // Ideally, use key=prop to force reset, or simpler logic.

  const selisih = stokFisik - item.stokSistem;

  const handleBlur = async () => {
    // Only save if changed
    if (stokFisik === item.stokFisik && keterangan === (item.keterangan || ''))
      return;

    // Validate input using Zod schema
    const validation = stockOpnameItemSchema.safeParse({
      stokFisik,
      keterangan,
    });

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message;
      toast.error(errorMessage || 'Input tidak valid');
      // Revert to original value
      setStokFisik(item.stokFisik);
      setKeterangan(item.keterangan || '');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateStockOpnameItem(
        item.id,
        stokFisik,
        keterangan
      );
      if (!result.success) {
        toast.error(result.error || 'Gagal menyimpan perubahan item');
        // Revert on server error
        setStokFisik(item.stokFisik);
        setKeterangan(item.keterangan || '');
      } else {
        toast.success('Perubahan berhasil disimpan');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TableRow className={cn(selisih !== 0 && 'bg-muted/30')}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="font-medium">{item.barang.nama}</div>
        <div className="text-xs text-muted-foreground">
          {item.barang.kodeBarang}
        </div>
      </TableCell>
      <TableCell>{item.barang.satuan?.nama || 'Pcs'}</TableCell>
      <TableCell className="text-right">{item.stokSistem}</TableCell>
      <TableCell className="text-right">
        {isDraft ? (
          <Input
            type="number"
            value={stokFisik}
            onChange={(e) => setStokFisik(parseInt(e.target.value) || 0)}
            onBlur={handleBlur}
            className={cn(
              'h-8 text-right',
              selisih !== 0 && 'border-yellow-500 focus-visible:ring-yellow-500'
            )}
          />
        ) : (
          stokFisik
        )}
      </TableCell>
      <TableCell
        className={cn(
          'text-right font-medium',
          selisih > 0 ? 'text-green-600' : selisih < 0 ? 'text-red-600' : ''
        )}
      >
        {selisih > 0 ? `+${selisih}` : selisih}
      </TableCell>
      <TableCell>
        {isDraft ? (
          <div className="relative">
            <Input
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              onBlur={handleBlur}
              className="h-8"
              placeholder="Ket..."
            />
            {isSaving && (
              <div className="absolute right-2 top-2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          item.keterangan || '-'
        )}
      </TableCell>
    </TableRow>
  );
}
