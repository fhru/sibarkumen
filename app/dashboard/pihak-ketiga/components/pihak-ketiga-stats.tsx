'use client';

import { Users } from 'lucide-react';

interface PihakKetigaStatsProps {
  totalPihakKetiga: number;
}

export function PihakKetigaStats({ totalPihakKetiga }: PihakKetigaStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="flex flex-col justify-between rounded-lg border bg-background dark:bg-input/30 p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Pihak Ketiga
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Users className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {totalPihakKetiga}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Supplier / Rekanan terdaftar
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border-2 border-dashed border-muted p-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-8 rounded-full bg-muted" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-8 w-12 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border-2 border-dashed border-muted p-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-8 rounded-full bg-muted" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-8 w-12 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
