'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

export function OverviewChart({ data, noCard = false }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const ChartContent = () => {
      if (!data || data.length === 0) {
          return (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Tidak ada data transaksi
              </div>
          )
      }
      return (
        <div className="h-[400px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
                data={data}
                margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 0,
                }}
            >
                <defs>
                <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                    }}
                />
                <Legend />
                <Area 
                    type="monotone" 
                    dataKey="Masuk" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorMasuk)" 
                    strokeWidth={2}
                />
                <Area 
                    type="monotone" 
                    dataKey="Keluar" 
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    fill="url(#colorKeluar)" 
                    strokeWidth={2}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      );
  };

  if (noCard) {
      return <ChartContent />;
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Overview Transaksi (6 Bulan Terakhir)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <ChartContent />
      </CardContent>
    </Card>
  );
}
