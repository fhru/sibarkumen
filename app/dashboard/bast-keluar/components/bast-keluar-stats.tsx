import { FileText, DollarSign, Calendar } from 'lucide-react';

interface BastKeluarStatsProps {
  stats: {
    total: number;
    totalValue: number;
    thisMonth: number;
  };
}

export function BastKeluarStats({ stats }: BastKeluarStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total BAST */}
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total BAST Keluar
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <FileText className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total dokumen BAST
          </p>
        </div>
      </div>

      {/* Total Nilai */}
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Nilai Transaksi
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            Rp {stats.totalValue.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Akumulasi nilai BAST keluar
          </p>
        </div>
      </div>

      {/* BAST Bulan Ini */}
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            BAST Bulan Ini
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {stats.thisMonth}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dokumen dibuat bulan ini
          </p>
        </div>
      </div>
    </div>
  );
}
