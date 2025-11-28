'use client';

import { SpbDetailDialog } from './detail-dialog';

export const columns = [
    {
        accessorKey: 'nomorSpb',
        header: 'Nomor SPB',
    },
    {
        accessorKey: 'tanggalSpb',
        header: 'Tanggal',
        cell: ({ row }) => {
            const date = new Date(row.getValue('tanggalSpb'));
            return date.toLocaleDateString('id-ID');
        }
    },
    {
        accessorKey: 'pemohon.nama',
        header: 'Pemohon',
    },
    {
        accessorKey: 'keterangan',
        header: 'Keterangan',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const spb = row.original;
            return <SpbDetailDialog spb={spb} />;
        }
    }
];
