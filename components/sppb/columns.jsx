'use client';

import { SppbDetailDialog } from './detail-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            return row.original.hasBast ? 
                <Badge variant="default" className="bg-green-600">Selesai</Badge> : 
                <Badge variant="secondary">Menunggu BAST</Badge>;
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const sppb = row.original;

            if (sppb.hasBast) {
                return (
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled className="opacity-50">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>BAST sudah dibuat</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <SppbDetailDialog sppb={sppb} />
                    </div>
                );
            }

            return (
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/dashboard/bast-keluar/create?sppbId=${sppb.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <ArrowRightCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Buat BAST</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <SppbDetailDialog sppb={sppb} />
                </div>
            );
        }
    }
];
