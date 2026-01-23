import { getBastKeluarById } from '@/drizzle/actions/bast-keluar';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import { BastKeluarActions } from '../components/bast-keluar-actions';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Wallet } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default async function BastKeluarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBastKeluarById(Number(id));

  if (!result.success || !result.data) notFound();

  const bast = result.data;
  const subtotal = Number(bast.subtotal) || 0;
  const totalPpn = Number(bast.totalPpn) || 0;
  const grandTotal = Number(bast.grandTotal) || 0;

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4 pb-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/bast-keluar">
              BAST Keluar
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{bast.nomorBast}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {bast.nomorBast}
            </h2>
            <Badge variant="outline" className="font-mono">
              KELUAR
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Dibuat pada{' '}
            {format(new Date(bast.createdAt), 'PPP HH:mm', {
              locale: localeId,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BastKeluarActions bast={bast} />
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Informasi Dokumen */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Dokumen</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                No. BAST
              </dt>
              <dd className="font-medium mt-0.5">{bast.nomorBast}</dd>
              <dd className="text-muted-foreground text-xs">
                {format(new Date(bast.tanggalBast), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </dd>
            </div>
            <div className="border-t border-dashed my-2" />
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                No. SPPB
              </dt>
              <dd className="font-medium mt-0.5">
                <Link
                  href={`/dashboard/sppb/${bast.sppb?.id}`}
                  className="text-primary hover:underline"
                >
                  {bast.sppb?.nomorSppb || '-'}
                </Link>
              </dd>
              {bast.sppb?.tanggalSppb && (
                <dd className="text-muted-foreground text-xs">
                  {format(new Date(bast.sppb.tanggalSppb), 'dd MMMM yyyy', {
                    locale: localeId,
                  })}
                </dd>
              )}
            </div>
          </dl>
        </div>

        {/* Card 2: Pihak Terkait */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Pihak Terkait</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Pihak Pertama
              </dt>
              <dd className="font-medium mt-0.5">
                {bast.pihakPertama?.nama || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Pihak Kedua
              </dt>
              <dd className="font-medium mt-0.5">
                {bast.pihakKedua?.nama || '-'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Card 3: Ringkasan Nilai */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Ringkasan Nilai</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <h3 className="text-2xl font-bold tracking-tight text-primary mt-1">
                Rp {grandTotal.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total PPN</span>
                <span>Rp {totalPpn.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          {bast.keterangan && (
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              <span className="font-semibold">Ket:</span> {bast.keterangan}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Barang */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg px-1">Daftar Barang</h3>
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground overflow-hidden p-4 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Kode Barang
                </TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Harga Satuan
                </TableHead>
                <TableHead className="text-right">PPN</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bast.items?.length ? (
                bast.items.map((item, index) => (
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
                      {item.qtySerahTerima}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell py-3">
                      Rp {Number(item.hargaSatuan).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {item.persentasePpn}% (Rp{' '}
                      {Number(item.nilaiPpn).toLocaleString('id-ID')})
                    </TableCell>
                    <TableCell className="text-right font-medium py-3">
                      Rp {Number(item.totalHarga).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Tidak ada barang
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell colSpan={6} className="text-right py-4">
                  TOTAL
                </TableCell>
                <TableCell className="text-right text-primary py-4 text-lg">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
