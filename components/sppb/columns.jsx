'use client';

import { SppbDetailDialog } from './detail-dialog';

export const columns = [
    {
        accessorKey: 'nomorSppb',
        header: 'Nomor SPPB',
    },
    {
        accessorKey: 'tanggalSppb',
        header: 'Tanggal',
        cell: ({ row }) => {
            const date = new Date(row.getValue('tanggalSppb'));
            return date.toLocaleDateString('id-ID');
        }
    },
    {
        accessorKey: 'spb.nomorSpb',
        header: 'Dasar SPB',
    },
    {
        accessorKey: 'penerima.nama',
        header: 'Penerima',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const sppb = row.original;
            return <SppbDetailDialog sppb={sppb} />;
        }
    }
];
