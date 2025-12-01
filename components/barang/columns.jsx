'use client';

import { Badge } from '@/components/ui/badge';
import { EditBarangDialog } from './edit-barang-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const columns = [
  {
    accessorKey: 'kodeBarang',
    header: 'Kode',
  },
  {
    accessorKey: 'namaBarang',
    header: 'Nama Barang',
  },
  {
    accessorKey: 'kategori',
    header: 'Kategori',
  },
  {
    accessorKey: 'satuan',
    header: 'Satuan',
  },
  {
    accessorKey: 'stokTersedia',
    header: 'Stok',
    cell: ({ row }) => {
      const stok = row.getValue('stokTersedia');
      const min = row.original.stokMinimum;
      return (
        <Badge variant={stok <= min ? 'destructive' : 'outline'}>
          {stok}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'hargaSatuan',
    header: 'Harga Satuan',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('hargaSatuan'));
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(amount);
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const barang = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/dashboard/barang/${barang.id}/history`}>
                  <Button variant="ghost" size="icon">
                    <History className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Riwayat Stok</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <EditBarangDialog barang={barang} />
        </div>
      );
    },
  },
];
