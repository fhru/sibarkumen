import { getBastMasukById } from '@/drizzle/actions/bast-masuk';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
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

export const metadata = {
  title: 'Detail BAST Masuk',
  description: 'Informasi detail penerimaan barang',
};

export default async function BastMasukDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const { success, data } = await getBastMasukById(id);

  if (!success || !data) {
    notFound();
  }

  // Calculate generic total value locally for display
  const totalValue = data.items.reduce((acc, item) => {
    return (
      acc + item.qtyKemasan * item.isiPerKemasan * parseFloat(item.hargaSatuan)
    );
  }, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/bast-masuk">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {data.nomorBast}
            </h2>
            <p className="text-muted-foreground">Detail Penerimaan Barang</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Placeholder for Print/Export features */}
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Nomor Referensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.nomorReferensi}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tanggal BAST:{' '}
              {format(new Date(data.tanggalBast), 'dd MMMM yyyy', {
                locale: idLocale,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Asal Pembelian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.asalPembelian?.nama || '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pihak Ketiga: {data.pihakKetiga?.nama || '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalValue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.items.length} Jenis Barang
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Content (Items) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daftar Barang Diterima</CardTitle>
            <CardDescription>
              Detail barang yang masuk dalam BAST ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Qty Kemasan</TableHead>
                  <TableHead className="text-right">Isi/Kemasan</TableHead>
                  <TableHead className="text-right">
                    Total (Satuan Kecil)
                  </TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.barang.nama}</div>
                      <div className="text-xs text-muted-foreground">
                        Kode: {item.barang.kodeBarang}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.qtyKemasan} {item.satuanKemasan?.nama}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.isiPerKemasan}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.qtyTotal} {item.barang.satuanId ? 'Unit' : ''}
                      {/* Note: Ideally fetch satuan terkecil name too, but simplistic for now */}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {parseFloat(item.hargaSatuan).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Lainnya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Nomor BAPB
                </span>
                <div className="font-medium">{data.nomorBapb}</div>
              </div>
              <div className="border-t pt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Tanggal BAPB
                </span>
                <div className="font-medium">
                  {format(new Date(data.tanggalBapb), 'dd MMMM yyyy', {
                    locale: idLocale,
                  })}
                </div>
              </div>
              <div className="border-t pt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  PPTK / PPK
                </span>
                <div className="font-medium">{data.pptkPpk?.nama || '-'}</div>
              </div>
              <div className="border-t pt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Keterangan
                </span>
                <div className="text-sm">{data.keterangan || '-'}</div>
              </div>
              <div className="border-t pt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Rekening
                </span>
                <div className="text-sm">
                  {data.rekening?.namaBank} - {data.rekening?.nomorRekening}{' '}
                  <br />
                  a.n {data.rekening?.namaPemilik}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
