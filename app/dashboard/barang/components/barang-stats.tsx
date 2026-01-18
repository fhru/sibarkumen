import { Package, AlertTriangle, Layers } from 'lucide-react';

interface BarangStatsProps {
  totalItems: number;
  lowStockCount: number;
  topCategory: string;
}

export function BarangStats({
  totalItems,
  lowStockCount,
  topCategory,
}: BarangStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Barang */}
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Barang
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Package className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {totalItems}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Jenis barang terdaftar
          </p>
        </div>
      </div>

      {/* Stok Menipis */}
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Stok Menipis
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <AlertTriangle
              className={`h-4 w-4 ${
                lowStockCount > 0 ? 'text-red-500' : 'text-foreground'
              }`}
            />
          </div>
        </div>

        <div className="mt-4">
          <div
            className={`text-2xl font-bold tracking-tight ${
              lowStockCount > 0 ? 'text-red-500' : 'text-foreground'
            }`}
          >
            {lowStockCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Barang dengan stok &le; 5
          </p>
        </div>
      </div>

      {/* Kategori Terbanyak */}
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Kategori Terbanyak
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Layers className="h-4 w-4 text-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <div
            className="text-2xl font-bold text-foreground tracking-tight truncate"
            title={topCategory}
          >
            {topCategory}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Distribusi tertinggi
          </p>
        </div>
      </div>
    </div>
  );
}
