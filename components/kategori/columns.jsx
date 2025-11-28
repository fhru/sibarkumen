'use client';

import { KategoriDialog } from './kategori-dialog';

export const columns = [
  {
    accessorKey: 'kode',
    header: 'Kode',
  },
  {
    accessorKey: 'nama',
    header: 'Nama Kategori',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const kategori = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <KategoriDialog kategori={kategori} isEdit />
        </div>
      );
    },
  },
];
