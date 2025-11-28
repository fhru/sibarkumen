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

export function BastKeluarDetailDialog({ bast }) {
  const totalFinal = bast.details.reduce(
    (acc, item) => acc + item.hargaSetelahPpn,
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
          <DialogTitle>Detail BAST Keluar: {bast.nomorBast}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="font-semibold block">Tanggal:</span>
            {new Date(bast.tanggalBast).toLocaleDateString('id-ID')}
          </div>
          <div>
            <span className="font-semibold block">Dasar SPPB:</span>
            {bast.sppb?.nomorSppb || '-'}
          </div>
          <div>
            <span className="font-semibold block">Pihak Menerima:</span>
            {bast.pihakMenerima?.nama}
          </div>
          <div>
            <span className="font-semibold block">Pihak Menyerahkan:</span>
            {bast.pihakMenyerahkan?.pegawai?.nama}
          </div>
          {bast.keterangan && (
            <div className="col-span-2">
              <span className="font-semibold block">Keterangan:</span>
              {bast.keterangan}
            </div>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Barang</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Total Harga</TableHead>
                <TableHead className="text-right">PPN</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bast.details?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.barang?.kodeBarang}</TableCell>
                  <TableCell>{item.barang?.namaBarang}</TableCell>
                  <TableCell className="text-right">
                    {item.volume} {item.barang?.satuan}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(item.jumlahHarga / item.volume)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(item.jumlahHarga)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(item.ppn)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(item.hargaSetelahPpn)}
                  </TableCell>
                </TableRow>
              ))}
              {(!bast.details || bast.details.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Tidak ada detail barang
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={6} className="text-right font-bold">
                  Total Akhir
                </TableCell>
                <TableCell className="text-right font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(totalFinal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
            <Link href={`/print/bast-keluar/${bast.id}`} target="_blank">
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
