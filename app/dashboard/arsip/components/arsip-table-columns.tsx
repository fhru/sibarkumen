'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArsipDocument } from '@/drizzle/actions/arsip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const columns: ColumnDef<ArsipDocument>[] = [
  {
    accessorKey: 'tipe',
    header: 'Tipe Dokumen',
    cell: ({ row }) => {
      const type = row.getValue('tipe') as string;
      let label = type;
      let variant: 'default' | 'secondary' | 'outline' | 'destructive' =
        'outline';

      switch (type) {
        case 'BAST_MASUK':
          label = 'BAST Masuk';
          variant = 'default';
          break;
        case 'SPB':
          label = 'SPB';
          variant = 'secondary';
          break;
        case 'SPPB':
          label = 'SPPB';
          variant = 'outline'; // Or custom color class if needed
          break;
        case 'BAST_KELUAR':
          label = 'BAST Keluar';
          variant = 'default';
          break;
        case 'STOCK_OPNAME':
          label = 'Stock Opname';
          variant = 'secondary';
          break;
      }

      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    accessorKey: 'nomor',
    header: 'Nomor Dokumen',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('nomor')}</div>
    ),
  },
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    cell: ({ row }) => {
      return format(new Date(row.getValue('tanggal')), 'dd MMMM yyyy', {
        locale: id,
      });
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string | null;
      if (!status) return <span className="text-muted-foreground">-</span>;

      let variant: 'default' | 'secondary' | 'outline' | 'destructive' =
        'outline';
      if (status === 'SELESAI' || status === 'COMPLETED') variant = 'default';
      else if (status === 'BATAL' || status === 'CANCELLED')
        variant = 'destructive';
      else variant = 'secondary';

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => (
      <div
        className="max-w-[300px] truncate"
        title={row.getValue('keterangan') as string}
      >
        {row.getValue('keterangan') || '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const doc = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href={doc.link}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lihat Detail</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];
