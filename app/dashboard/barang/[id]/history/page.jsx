import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { getBarangById, getBarangHistory } from '@/app/actions/barang';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function StockHistoryPage({ params }) {
  const session = await auth();
  if (!session) redirect('/login');

  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) notFound();

  const [item, history] = await Promise.all([
    getBarangById(itemId),
    getBarangHistory(itemId),
  ]);

  if (!item) notFound();

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/barang">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kartu Stok Barang</h1>
          <p className="text-muted-foreground">Riwayat transaksi masuk dan keluar</p>
        </div>
      </div>

      {/* Item Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informasi Barang</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{item.namaBarang}</div>
            <p className="text-xs text-muted-foreground">Kode: {item.kodeBarang}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Tersedia</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.stokTersedia} <span className="text-sm font-normal text-muted-foreground">{item.satuan}</span></div>
            <p className="text-xs text-muted-foreground">
                Min: {item.stokMinimum} {item.satuan}
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kategori</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold">{item.kategori}</div>
                <p className="text-xs text-muted-foreground">Asal: {item.asalPembelian}</p>
            </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Perubahan Stok</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Belum ada riwayat transaksi untuk barang ini.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nomor Dokumen</TableHead>
                    <TableHead>Jenis Transaksi</TableHead>
                    <TableHead>Keterangan / Pihak</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {new Date(row.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{row.docNumber}</TableCell>
                      <TableCell>
                        {row.type === 'MASUK' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                            <ArrowDownRight className="mr-1 h-3 w-3" /> Masuk
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
                            <ArrowUpRight className="mr-1 h-3 w-3" /> Keluar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm">{row.actor}</span>
                            <span className="text-xs text-muted-foreground">{row.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${row.type === 'MASUK' ? 'text-green-600' : 'text-red-600'}`}>
                        {row.type === 'MASUK' ? '+' : '-'}{row.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
