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

export function BastMasukDetailDialog({ bast }) {
  const totalTransaksi = bast.details.reduce(
    (acc, item) => acc + item.totalHarga,
    0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail BAST: {bast.nomorBast}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="font-semibold block">Tanggal:</span>
            {new Date(bast.tanggalBast).toLocaleDateString('id-ID')}
          </div>
          <div>
            <span className="font-semibold block">Pihak Ketiga:</span>
            {bast.pihakKetiga}
          </div>
          <div>
            <span className="font-semibold block">Asal Pembelian:</span>
            {bast.asalPembelian}
          </div>
          <div>
            <span className="font-semibold block">Rekening:</span>
            {bast.rekening?.nomorRekening} - {bast.rekening?.namaBank}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Barang</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bast.details.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.barang?.kodeBarang}</TableCell>
                  <TableCell>{item.barang?.namaBarang}</TableCell>
                  <TableCell className="text-right">
                    {item.jumlah} {item.barang?.satuan}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(item.hargaSatuan)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(item.totalHarga)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Grand Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(totalTransaksi)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
            <Link href={`/print/bast-masuk/${bast.id}`} target="_blank">
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
