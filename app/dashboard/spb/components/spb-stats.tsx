import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SPBStatsProps {
  total: number;
  menungguSppb: number;
  selesai: number;
}

export function SPBStats({ total, menungguSppb, selesai }: SPBStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total SPB */}
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total SPB
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <FileText className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total seluruh permintaan barang
          </p>
        </div>
      </div>

      {/* Menunggu SPPB */}
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Menunggu SPPB
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {menungguSppb}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Menunggu proses pembuatan SPPB
          </p>
        </div>
      </div>

      {/* Selesai */}
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Selesai
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {selesai}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            SPB telah selesai diproses
          </p>
        </div>
      </div>
    </div>
  );
}
