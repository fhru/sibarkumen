'use client';

import { SpbDetailDialog } from './detail-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            return row.original.hasSppb ? 
                <Badge variant="default" className="bg-green-600">Sudah Diproses</Badge> : 
                <Badge variant="secondary">Belum Diproses</Badge>;
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const spb = row.original;
            
            if (spb.hasSppb) {
                return (
                    <div className="flex items-center gap-2">
                        {/* Link to SPPB list? Or just show icon indicating it's done */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled className="opacity-50">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Sudah dibuatkan SPPB</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <SpbDetailDialog spb={spb} />
                    </div>
                );
            }

            return (
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/dashboard/sppb/create?spbId=${spb.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <ArrowRightCircle className="h-4 w-4 text-blue-600" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Proses SPPB</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <SpbDetailDialog spb={spb} />
                </div>
            );
        }
    }
];

