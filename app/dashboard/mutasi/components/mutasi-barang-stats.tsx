import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon } from 'lucide-react';

interface MutasiBarangStatsProps {
  totalQtyMasuk: number;
  totalQtyKeluar: number;
  totalPenyesuaian: number;
  totalTransaksi: number;
}

export function MutasiBarangStats({
  totalQtyMasuk,
  totalQtyKeluar,
  totalPenyesuaian,
  totalTransaksi,
}: MutasiBarangStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Qty Masuk
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <ArrowUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            {totalQtyMasuk.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Barang yang masuk ke gudang
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Qty Keluar
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ArrowDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
            {totalQtyKeluar.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Barang yang keluar dari gudang
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Penyesuaian
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <RefreshCwIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 tracking-tight">
            {totalPenyesuaian.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Transaksi penyesuaian stok
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Transaksi
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <RefreshCwIcon className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {totalTransaksi.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Semua mutasi barang
          </p>
        </div>
      </div>
    </div>
  );
}
