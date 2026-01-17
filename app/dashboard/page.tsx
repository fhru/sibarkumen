'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Box,
  ArrowDownUp,
  AlertTriangle,
  QrCode,
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  History,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

const stockData = [
  { name: 'Mon', in: 40, out: 24 },
  { name: 'Tue', in: 30, out: 13 },
  { name: 'Wed', in: 20, out: 38 },
  { name: 'Thu', in: 27, out: 39 },
  { name: 'Fri', in: 18, out: 48 },
  { name: 'Sat', in: 23, out: 38 },
  { name: 'Sun', in: 34, out: 43 },
];

const lowStockItems = [
  { id: 1, name: 'Kertas A4 80gr', stock: 5, unit: 'Rim' },
  { id: 2, name: 'Tinta Canon GI-71BK', stock: 2, unit: 'Botol' },
  { id: 3, name: 'Pulpen Snowman Black', stock: 3, unit: 'Box' },
  { id: 4, name: 'Lakban Bening 2 Inch', stock: 4, unit: 'Roll' },
  { id: 5, name: 'Staples No. 10', stock: 8, unit: 'Box' },
];

const recentMovements = [
  { id: 1, name: 'Kertas A4 80gr', type: 'in', qty: 50, time: '2h ago' },
  { id: 2, name: 'Tinta Canon GI-71BK', type: 'out', qty: 2, time: '4h ago' },
  { id: 3, name: 'Baterai AA Alkaline', type: 'out', qty: 10, time: '5h ago' },
  { id: 4, name: 'Amplop Coklat F4', type: 'in', qty: 100, time: '1d ago' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang kembali. Berikut adalah ringkasan inventaris hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Widget A: Stock Velocity (Hero Card - Span 2x2) */}
        <Card className="md:col-span-2 md:row-span-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 h-[80px]">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Stock Velocity
              </CardTitle>
              <CardDescription className="text-xs">
                Statistik barang masuk vs keluar mingguan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  In
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Out
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.05} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.05} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    fontSize: '12px',
                  }}
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="in"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorIn)"
                  name="Masuk"
                />
                <Area
                  type="monotone"
                  dataKey="out"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorOut)"
                  name="Keluar"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Widget B: Low Stock Monitor (Span 1x2) */}
        <Card className="md:col-span-1 md:row-span-2 shadow-none flex flex-col">
          <CardHeader className="pb-4 h-[80px]">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <CardTitle className="text-lg font-medium">
                Critical Stock
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Barang yang hampir habis
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 px-0">
            <ScrollArea className="h-[300px] px-6">
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium leading-none">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.unit}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-rose-600">
                        {item.stock}
                      </span>
                      <span className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">
                        Left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 mt-auto border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Lihat Semua Peringatan
            </Button>
          </div>
        </Card>

        <Card className="md:col-span-1 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <QrCode className="h-3.5 w-3.5" /> Quick Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between h-10 group"
            >
              <span>Scan Barcode</span>
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between h-10 group"
            >
              <span>Input Barang</span>
              <Package className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Button>
          </CardContent>
        </Card>

        {/* Widget D: Portfolio Value */}
        <Card className="md:col-span-1 shadow-none bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-primary-foreground/70 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="h-3 w-3" /> Asset Valuation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">Rp 2.45B</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+4.2% dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        {/* Widget E: Recent Movements (Span 4) */}
        <Card className="md:col-span-4 shadow-none">
          <CardHeader className="border-b py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">
                Recent Activity
              </CardTitle>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground pr-0"
            >
              Lihat Histori Lengkap
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {recentMovements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                        item.type === 'in'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      <ArrowDownUp
                        className={cn(
                          'h-4 w-4',
                          item.type === 'in' ? 'rotate-180' : ''
                        )}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div
                        className={cn(
                          'text-sm font-semibold',
                          item.type === 'in'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        )}
                      >
                        {item.type === 'in' ? '+' : '-'}
                        {item.qty}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">
                        Kuantitas
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] border-none"
                    >
                      {item.type === 'in' ? 'Masuk' : 'Keluar'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
