import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileClock, Truck } from "lucide-react";

interface StatCardsProps {
  stats: {
    totalSku: number;
    pendingSpb: number;
    pendingSppb: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-lg border bg-background dark:bg-input/30 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total SKU Aktif</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSku}</div>
          <p className="text-xs text-muted-foreground">
            Jenis barang terdaftar
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-lg border bg-background dark:bg-input/30 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SPB Pending</CardTitle>
          <FileClock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingSpb}</div>
          <p className="text-xs text-muted-foreground">SPB menunggu diproses</p>
        </CardContent>
      </Card>
      <Card className="rounded-lg border bg-background dark:bg-input/30 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SPPB Pending</CardTitle>
          <Truck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingSppb}</div>
          <p className="text-xs text-muted-foreground">SPPB menunggu BAST</p>
        </CardContent>
      </Card>
    </div>
  );
}
