import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">
            Jenis barang terdaftar
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
          <AlertTriangle
            className={`h-4 w-4 ${lowStockCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-500' : ''}`}
          >
            {lowStockCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Barang dengan stok &le; 5
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Kategori Terbanyak
          </CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={topCategory}>
            {topCategory}
          </div>
          <p className="text-xs text-muted-foreground">Distribusi tertinggi</p>
        </CardContent>
      </Card>
    </div>
  );
}
