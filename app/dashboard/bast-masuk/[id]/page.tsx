import { getBastMasukById } from '@/drizzle/data/bast-masuk';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Edit,
  FileText,
  Printer,
  Wallet,
  Users,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Detail BAST Masuk',
  description: 'Informasi lengkap BAST Masuk',
};

interface DetailBastMasukPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailBastMasukPage({
  params,
}: DetailBastMasukPageProps) {
  const { id } = await params;
  const bastId = Number(id);

  if (isNaN(bastId)) {
    notFound();
  }

  const { success, data } = await getBastMasukById(bastId);

  if (!success || !data) {
    notFound();
  }

  // Calculate generic total price for display
  const totalEstimasi = data.items.reduce((sum, item) => {
    return sum + Number(item.qty) * Number(item.hargaSatuan);
  }, 0);

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4 pb-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/bast-masuk">
              BAST Masuk
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.nomorReferensi}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {data.nomorReferensi}
            </h2>
            <Badge variant="outline" className="font-mono">
              MASUK
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Dibuat pada{' '}
            {format(new Date(data.createdAt), 'PPP HH:mm', {
              locale: localeId,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/bast-masuk/${bastId}/edit`}>
            <Button variant="outline" size={'sm'}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Informasi Dokumen */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground  p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Dokumen</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                No. BAST
              </dt>
              <dd className="font-medium mt-0.5">{data.nomorBast}</dd>
              <dd className="text-muted-foreground text-xs">
                {format(new Date(data.tanggalBast), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </dd>
            </div>
            <div className="border-t border-dashed my-2" />
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                No. BAPB
              </dt>
              <dd className="font-medium mt-0.5">{data.nomorBapb}</dd>
              <dd className="text-muted-foreground text-xs">
                {format(new Date(data.tanggalBapb), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Card 2: Pihak Terkait */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground  p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Pihak Terkait</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Pihak Ketiga
              </dt>
              <dd className="font-medium mt-0.5">
                {data.pihakKetiga?.nama || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                PPTK / PPK
              </dt>
              <dd className="font-medium mt-0.5">
                {data.pptkPpk?.nama || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Asal Pembelian
              </dt>
              <dd className="font-medium mt-0.5">
                {data.asalPembelian?.nama || '-'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Card 3: Estimasi Nilai & Info Lain */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground  p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Estimasi Nilai</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Estimasi Barang
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-primary mt-1">
                Rp {totalEstimasi.toLocaleString('id-ID')}
              </h3>
            </div>
            {data.rekening && (
              <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">Rekening:</p>
                <p>
                  {data.rekening.namaBank} - {data.rekening.nomorRekening}
                </p>
                <p className="text-muted-foreground">
                  a.n {data.rekening.namaPemilik}
                </p>
              </div>
            )}
          </div>
          {data.keterangan && (
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              <span className="font-semibold">Ket:</span> {data.keterangan}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Barang */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg px-1">Daftar Barang</h3>
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground  overflow-hidden p-4 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Kode Barang
                </TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Satuan</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Harga Satuan
                </TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Tidak ada barang
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="py-3">{index + 1}</TableCell>
                    <TableCell className="font-medium py-3">
                      {item.barang?.nama || '-'}
                      {item.keterangan && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.keterangan}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      {item.barang?.kodeBarang || '-'}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {item.barang?.satuan?.nama || '-'}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell py-3">
                      Rp {Number(item.hargaSatuan).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-medium py-3">
                      Rp{' '}
                      {(
                        Number(item.qty) * Number(item.hargaSatuan)
                      ).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {/* Grand Total Row */}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell colSpan={6} className="text-right py-4">
                  TOTAL
                </TableCell>
                <TableCell className="text-right text-primary py-4 text-lg">
                  Rp {totalEstimasi.toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
