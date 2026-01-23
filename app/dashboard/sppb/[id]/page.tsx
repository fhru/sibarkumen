import { getSPPBById } from '@/drizzle/actions/sppb';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { SPPBActions } from '@/app/dashboard/sppb/components/sppb-actions';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  FileText,
  Users,
  Info,
  Clock,
  CheckCircle,
  Link as LinkIcon,
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
  title: 'Detail SPPB',
  description: 'Informasi lengkap Surat Perintah Pengeluaran Barang',
};

export default async function SPPBDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getSPPBById(Number(id));

  if (!result.success || !result.data) {
    notFound();
  }

  const sppb = result.data;
  const isCompleted = !!sppb.serahTerimaOleh;

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4 pb-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/sppb">SPPB</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{sppb.nomorSppb}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {sppb.nomorSppb}
            </h2>
            <Badge variant="outline" className="font-mono">
              PERINTAH PENYALURAN
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Diterbitkan pada{' '}
            {format(new Date(sppb.tanggalSppb), 'PPP', {
              locale: localeId,
            })}
          </p>
        </div>
        <SPPBActions sppb={sppb} />
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
                Nomor SPPB
              </dt>
              <dd className="font-medium mt-0.5">{sppb.nomorSppb}</dd>
            </div>
            <div className="border-t border-dashed my-2" />
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Tanggal Terbit
              </dt>
              <dd className="font-medium mt-0.5">
                {format(new Date(sppb.tanggalSppb), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </dd>
            </div>
            <div className="border-t border-dashed my-2" />
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Dasar SPB
              </dt>
              <dd className="font-medium mt-0.5">
                <Link
                  href={`/dashboard/spb/${sppb.spb?.id}`}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <LinkIcon className="h-3 w-3" />
                  {sppb.spb?.nomorSpb}
                </Link>
              </dd>
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
                Pejabat Penyetuju
              </dt>
              <dd className="font-medium mt-0.5">
                {sppb.pejabatPenyetuju?.nama || '-'}
              </dd>
              {sppb.pejabatPenyetuju?.nip && (
                <dd className="text-xs text-muted-foreground">
                  NIP. {sppb.pejabatPenyetuju.nip}
                </dd>
              )}
            </div>
            <div className="border-t border-dashed my-2" />
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Penerima Barang
              </dt>
              <dd className="font-medium mt-0.5">
                {sppb.diterimaOleh?.nama || '-'}
              </dd>
              {sppb.diterimaOleh?.nip && (
                <dd className="text-xs text-muted-foreground">
                  NIP. {sppb.diterimaOleh.nip}
                </dd>
              )}
            </div>
            {sppb.serahTerimaOleh && (
              <>
                <div className="border-t border-dashed my-2" />
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                    Diserahkan Oleh
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {sppb.serahTerimaOleh.nama}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Card 3: Status Info */}
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Status & Keterangan</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Status Saat Ini
              </p>
              {isCompleted ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                >
                  Selesai
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  Menunggu BAST
                </Badge>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Status Cetak</p>
              {sppb.isPrinted ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Sudah Dicetak
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  Belum Dicetak
                </Badge>
              )}
            </div>
            {sppb.keterangan && (
              <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">
                  Keterangan:
                </p>
                <p>{sppb.keterangan}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Barang */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg px-1">Daftar Barang Disetujui</h3>
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground overflow-hidden p-4 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Kode Barang
                </TableHead>
                <TableHead className="text-right">Qty Disetujui</TableHead>
                <TableHead className="text-right">Satuan</TableHead>
                <TableHead className="w-[200px]">Keterangan Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!sppb.items || sppb.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Tidak ada barang
                  </TableCell>
                </TableRow>
              ) : (
                sppb.items.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="py-3">{index + 1}</TableCell>
                    <TableCell className="font-medium py-3">
                      {item.barang?.nama || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      {item.barang?.kodeBarang || '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold py-3">
                      {item.qtyDisetujui}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {item.barang?.satuan?.nama || '-'}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {item.keterangan || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* BAST Keluar Section - Show if SPPB is completed */}
      {isCompleted && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg px-1">
            BAST Keluar (Berita Acara Serah Terima)
          </h3>
          <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground p-6">
            {sppb.bastKeluarList && sppb.bastKeluarList.length > 0 ? (
              <div className="space-y-2">
                {sppb.bastKeluarList.map((bast: any) => (
                  <Link
                    key={bast.id}
                    href={`/dashboard/bast-keluar/${bast.id}`}
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{bast.nomorBast}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(new Date(bast.tanggalBast), 'dd MMM yyyy', {
                            locale: localeId,
                          })}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        Total: Rp{' '}
                        {parseFloat(bast.grandTotal).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Belum ada BAST Keluar untuk SPPB ini
                </p>
                <Button asChild size="sm">
                  <Link
                    href={`/dashboard/bast-keluar/create?sppbId=${sppb.id}`}
                  >
                    Buat BAST Keluar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
