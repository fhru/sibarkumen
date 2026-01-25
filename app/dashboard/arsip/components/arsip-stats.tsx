"use client";

import { FileText, Truck, ClipboardCheck } from "lucide-react";

interface ArsipStatsProps {
  stats: {
    spbTotal: number;
    sppbTotal: number;
    bastTotal: number;
  };
}

export function ArsipStats({ stats }: ArsipStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
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
            {stats.spbTotal}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dokumen SPB tersimpan
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total SPPB
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {stats.sppbTotal}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dokumen SPPB tersimpan
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total BAST
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
            <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {stats.bastTotal}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Akumulasi BAST masuk & keluar
          </p>
        </div>
      </div>
    </div>
  );
}
