'use client';

import { useState, useEffect } from 'react';
import { OverviewChart } from './overview-chart';
import { getDashboardChartData } from '@/app/actions/dashboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function ChartContainer({ initialData }) {
  const [range, setRange] = useState('6m');
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);

  // Skip initial fetch if initialData is provided, 
  // but fetch on subsequent range changes
  useEffect(() => {
      // Avoid re-fetching initial data on first mount if it matches range
      // Ideally we just fetch when range changes from default
      if (range === '6m' && initialData && initialData.length > 0) {
          setData(initialData);
          return;
      }

      const loadData = async () => {
          setLoading(true);
          const res = await getDashboardChartData(range);
          setData(res.data || res || []);
          setLoading(false);
      };
      loadData();
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Overview Transaksi</CardTitle>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[160px] h-8">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Hari Terakhir</SelectItem>
            <SelectItem value="30d">30 Hari Terakhir</SelectItem>
            <SelectItem value="6m">6 Bulan Terakhir</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0 pb-4 relative min-h-[400px]">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )}
        {/* Pass data to the presentational chart component */}
        {/* Reuse the responsive container structure from OverviewChart, 
            but OverviewChart has its own Card wrapper.
            We should extract the inner chart from OverviewChart OR 
            Update OverviewChart to NOT have a Card wrapper.
            
            Refactoring OverviewChart to be pure chart:
        */}
        <OverviewChart data={data} noCard={true} />
      </CardContent>
    </Card>
  );
}
