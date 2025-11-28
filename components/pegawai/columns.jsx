'use client';

import { EditPegawaiDialog } from './edit-pegawai-dialog';

export const columns = [
  {
    accessorKey: 'nip',
    header: 'NIP',
  },
  {
    accessorKey: 'nama',
    header: 'Nama Lengkap',
  },
  {
    accessorKey: 'jabatan',
    header: 'Jabatan',
  },
  {
    accessorKey: 'unitKerja',
    header: 'Unit Kerja',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const pegawai = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditPegawaiDialog pegawai={pegawai} />
        </div>
      );
    },
  },
];
