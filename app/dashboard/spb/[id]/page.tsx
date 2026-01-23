import { getSPBById } from '@/drizzle/actions/spb';
import { notFound, redirect } from 'next/navigation';
import { getSession, getCurrentPegawai } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';
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
  FileText,
  Users,
  Info,
  Clock,
  CheckCircle,
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
import { SPBActions } from '../components/spb-actions';
import { SPBStatusBadge } from '../components/spb-status-badge';

export const metadata = {
  title: 'Detail SPB',
  description: 'Informasi lengkap Surat Permintaan Barang',
};

interface DetailSPBPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailSPBPage({ params }: DetailSPBPageProps) {
  const { id } = await params;
  const spbId = Number(id);

  if (isNaN(spbId)) {
    notFound();
  }

  const spbData = await getSPBById(spbId);

  if (!spbData) {
    notFound();
  }

  // Authorization Check
  const session = await getSession();
  const userRole = (session?.user.role as Role) || 'petugas';

  if (userRole === 'petugas') {
    const profile = await getCurrentPegawai();
    if (!profile || spbData.pemohonId !== profile.id) {
      notFound(); // Or redirect to unauthorized
    }
  }

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4 pb-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/spb">SPB</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{spbData.nomorSpb}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {spbData.nomorSpb}
            </h2>
            <Badge variant="outline" className="font-mono">
              PERMINTAAN
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Diajukan pada{' '}
            {format(new Date(spbData.tanggalSpb), 'PPP', {
              locale: localeId,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SPBActions
            id={spbData.id}
            status={spbData.status}
            isPrinted={spbData.isPrinted}
          />
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
                Nomor SPB
              </dt>
              <dd className="font-medium mt-0.5">{spbData.nomorSpb}</dd>
            </div>
            <div className="border-t border-dashed my-2" />
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Tanggal Pengajuan
              </dt>
              <dd className="font-medium mt-0.5">
                {format(new Date(spbData.tanggalSpb), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
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
                Pemohon
              </dt>
              <dd className="font-medium mt-0.5">
                {spbData.pemohon?.nama || '-'}
              </dd>
            </div>
            {spbData.pemohon?.nip && (
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                  NIP
                </dt>
                <dd className="font-medium mt-0.5">{spbData.pemohon.nip}</dd>
              </div>
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
              <SPBStatusBadge status={spbData.status} />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Status Cetak</p>
              {spbData.isPrinted ? (
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
            {spbData.keterangan && (
              <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">
                  Keterangan:
                </p>
                <p>{spbData.keterangan}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Barang */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg px-1">Daftar Barang Permintaan</h3>
        <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground overflow-hidden p-4 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Kode Barang
                </TableHead>
                <TableHead className="text-right">Stok Saat Ini</TableHead>
                <TableHead className="text-right">Qty Diminta</TableHead>
                <TableHead className="text-right">Satuan</TableHead>
                <TableHead className="w-[200px]">Keterangan Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spbData.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Tidak ada barang
                  </TableCell>
                </TableRow>
              ) : (
                spbData.items.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="py-3">{index + 1}</TableCell>
                    <TableCell className="font-medium py-3">
                      {item.barang?.nama || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      {item.barang?.kodeBarang || '-'}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {item.barang?.stok || 0}
                    </TableCell>
                    <TableCell className="text-right font-bold py-3">
                      {item.qtyPermintaan}
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
    </div>
  );
}
