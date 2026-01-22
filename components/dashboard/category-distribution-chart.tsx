'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryPieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <div className="rounded-lg border bg-background dark:bg-input/30 p-4">
      <h3 className="flex items-center gap-2 font-semibold mb-2">
        <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        Komposisi Kategori
      </h3>
      <div className="h-[250px] w-full pb-4">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Tidak ada data kategori.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
