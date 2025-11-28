'use client';

import { AddRekeningDialog } from './add-rekening-dialog';

export const columns = [
  {
    accessorKey: 'namaBank',
    header: 'Nama Bank',
  },
  {
    accessorKey: 'kodeBank',
    header: 'Kode Bank',
  },
  {
    accessorKey: 'nomorRekening',
    header: 'Nomor Rekening',
  },
  {
    accessorKey: 'namaPemilik',
    header: 'Nama Pemilik',
  },
  {
    accessorKey: 'jenisRekening',
    header: 'Jenis',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const rekening = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <AddRekeningDialog rekening={rekening} isEdit />
        </div>
      );
    },
  },
];
