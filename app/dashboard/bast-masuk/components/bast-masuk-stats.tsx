import { PackagePlus, TrendingUp, Users } from 'lucide-react';

interface BastMasukStatsProps {
  totalBast: number;
  totalNilaiTransaksi: number;
  supplierTerbanyak: string;
}

export function BastMasukStats({
  totalBast,
  totalNilaiTransaksi,
  supplierTerbanyak,
}: BastMasukStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total BAST */}
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total BAST Masuk
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <PackagePlus className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {totalBast}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dokumen penerimaan barang
          </p>
        </div>
      </div>

      {/* Total Nilai Transaksi */}
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Nilai
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <TrendingUp className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            Rp {totalNilaiTransaksi.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total nilai transaksi
          </p>
        </div>
      </div>

      {/* Supplier Terbanyak */}
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Supplier Terbanyak
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Users className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div
            className="text-2xl font-bold text-foreground tracking-tight truncate"
            title={supplierTerbanyak}
          >
            {supplierTerbanyak}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pihak ketiga terbanyak
          </p>
        </div>
      </div>
    </div>
  );
}
