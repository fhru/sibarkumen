'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Printer } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export function SpbDetailDialog({ spb }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Permintaan: {spb.nomorSpb}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
                <span className="font-semibold block">Tanggal:</span>
                {new Date(spb.tanggalSpb).toLocaleDateString('id-ID')}
            </div>
            <div>
                <span className="font-semibold block">Pemohon:</span>
                {spb.pemohon?.nama}
            </div>
            <div className="col-span-2">
                <span className="font-semibold block">Keterangan:</span>
                {spb.keterangan || '-'}
            </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Barang</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="text-right">Jumlah Diminta</TableHead>
                <TableHead className="text-right">Satuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spb.details.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.barang?.kodeBarang}</TableCell>
                  <TableCell>{item.barang?.namaBarang}</TableCell>
                  <TableCell className="text-right font-medium">{item.jumlah}</TableCell>
                  <TableCell className="text-right">{item.barang?.satuan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
            <Link href={`/print/spb/${spb.id}`} target="_blank">
                <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak PDF
                </Button>
            </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
