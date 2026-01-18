'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BarangStatusFilterProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function BarangStatusFilter({
  value,
  onChange,
}: BarangStatusFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(val) => onChange(val === 'all' ? undefined : val)}
    >
      <SelectTrigger className="h-8 w-[150px]">
        <SelectValue placeholder="Status Stok" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Status</SelectItem>
        <SelectItem value="available">Tersedia</SelectItem>
        <SelectItem value="low">Stok Menipis</SelectItem>
        <SelectItem value="out">Stok Habis</SelectItem>
      </SelectContent>
    </Select>
  );
}
