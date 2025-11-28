'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { BastKeluarDetailDialog } from './detail-dialog';

export const columns = [
  {
    accessorKey: 'nomorBast',
    header: 'Nomor BAST',
  },
  {
    accessorKey: 'tanggalBast',
    header: 'Tanggal',
    cell: ({ row }) => {
      const date = new Date(row.getValue('tanggalBast'));
      return date.toLocaleDateString('id-ID');
    },
  },
  {
    accessorKey: 'sppb.nomorSppb',
    header: 'Dasar SPPB',
  },
  {
    accessorKey: 'pihakMenerima.nama',
    header: 'Pihak Menerima',
  },
  {
    accessorKey: 'pihakMenyerahkan.pegawai.nama',
    header: 'Pihak Menyerahkan',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const bast = row.original;
      return <BastKeluarDetailDialog bast={bast} />;
    },
  },
];
