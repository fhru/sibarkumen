'use client';

import { EditPejabatDialog } from './edit-pejabat-dialog';
import { Badge } from '@/components/ui/badge';

export const columns = [
  {
    accessorKey: 'pegawai.nama',
    header: 'Nama Pegawai',
  },
  {
    accessorKey: 'jenisJabatan',
    header: 'Jenis Jabatan',
  },
  {
    accessorKey: 'nomorSk',
    header: 'Nomor SK',
  },
  {
    accessorKey: 'tanggalSk',
    header: 'Tanggal SK',
    cell: ({ row }) => {
        const date = new Date(row.getValue('tanggalSk'));
        return date.toLocaleDateString('id-ID');
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const pejabat = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditPejabatDialog pejabat={pejabat} />
        </div>
      );
    },
  },
];
