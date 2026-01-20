'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

type MutasiBarang = {
  id: number;
  barangId: number;
  tanggal: Date;
  jenisMutasi: 'MASUK' | 'KELUAR' | 'PENYESUAIAN';
  qtyMasuk: number;
  qtyKeluar: number;
  stokAkhir: number;
  referensiId: string | null;
  sumberTransaksi: string | null;
  keterangan: string | null;
  barang: {
    id: number;
    nama: string;
    kodeBarang: string;
  };
};

interface MutasiDetailDialogProps {
  mutasi: MutasiBarang;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MutasiDetailDialog({
  mutasi,
  open,
  onOpenChange,
}: MutasiDetailDialogProps) {
  const jenisBadgeVariant =
    mutasi.jenisMutasi === 'MASUK'
      ? 'default'
      : mutasi.jenisMutasi === 'KELUAR'
        ? 'destructive'
        : 'secondary';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Mutasi Barang</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Barang */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Informasi Barang
            </h3>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Nama Barang
                </span>
                <span className="font-medium">{mutasi.barang.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Kode Barang
                </span>
                <span className="font-mono text-sm">
                  {mutasi.barang.kodeBarang}
                </span>
              </div>
            </div>
          </div>

          {/* Informasi Mutasi */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Informasi Mutasi
            </h3>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tanggal</span>
                <span className="font-medium">
                  {format(new Date(mutasi.tanggal), 'dd MMMM yyyy, HH:mm', {
                    locale: localeId,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Jenis Mutasi
                </span>
                <Badge variant={jenisBadgeVariant}>{mutasi.jenisMutasi}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Qty Masuk</span>
                <span
                  className={
                    mutasi.qtyMasuk > 0
                      ? 'font-bold text-green-600'
                      : 'text-muted-foreground'
                  }
                >
                  {mutasi.qtyMasuk > 0 ? `+${mutasi.qtyMasuk}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Qty Keluar
                </span>
                <span
                  className={
                    mutasi.qtyKeluar > 0
                      ? 'font-bold text-destructive'
                      : 'text-muted-foreground'
                  }
                >
                  {mutasi.qtyKeluar > 0 ? `-${mutasi.qtyKeluar}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Stok Akhir
                </span>
                <span
                  className={
                    mutasi.stokAkhir < 0
                      ? 'font-bold text-destructive'
                      : 'font-bold'
                  }
                >
                  {mutasi.stokAkhir.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Informasi Referensi */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Informasi Referensi
            </h3>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Nomor Referensi
                </span>
                <span className="font-mono text-sm">
                  {mutasi.referensiId || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Sumber Transaksi
                </span>
                <span className="text-sm">
                  {mutasi.sumberTransaksi?.replace(/_/g, ' ') || '-'}
                </span>
              </div>
              {mutasi.keterangan && (
                <div className="pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Keterangan
                  </span>
                  <p className="mt-1 text-sm">{mutasi.keterangan}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
