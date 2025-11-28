'use client';

import { BastMasukDetailDialog } from './detail-dialog';

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
        }
    },
    {
        accessorKey: 'asalPembelian',
        header: 'Asal Pembelian',
    },
    {
        accessorKey: 'pihakKetiga',
        header: 'Pihak Ketiga',
    },
    {
        accessorKey: 'pptkPpk.nama',
        header: 'PPTK / PPK',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const bast = row.original;
            return <BastMasukDetailDialog bast={bast} />;
        }
    }
];
