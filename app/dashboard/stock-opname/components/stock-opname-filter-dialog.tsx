'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AsyncSelect } from '@/components/ui/async-select';
import { fetchPegawaiList } from '@/drizzle/actions/stock-opname';

interface StockOpnameFilterDialogProps {
  statusValue: string | undefined;
  petugasValue: string | undefined;
  petugasList: { id: number; nama: string }[]; // Keep for initial option if needed, or we can just fetch
  onApplyFilters: (
    status: string | undefined,
    petugasId: string | undefined
  ) => void;
}

export function StockOpnameFilterDialog({
  statusValue,
  petugasValue,
  petugasList,
  onApplyFilters,
}: StockOpnameFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string | undefined>(statusValue);
  const [tempPetugas, setTempPetugas] = useState<number | undefined>(
    petugasValue ? parseInt(petugasValue) : undefined
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempStatus(statusValue);
      setTempPetugas(petugasValue ? parseInt(petugasValue) : undefined);
    }
    setOpen(nextOpen);
  };

  const handleApply = () => {
    onApplyFilters(tempStatus, tempPetugas?.toString());
    setOpen(false);
  };

  const handleReset = () => {
    setTempStatus(undefined);
    setTempPetugas(undefined);
  };

  const loadPegawaiOptions = async (query: string) => {
    const result = await fetchPegawaiList(query);
    return result.data || [];
  };

  // Find initial option object for AsyncSelect
  const initialPetugasOption = petugasValue
    ? petugasList.find((p) => p.id === parseInt(petugasValue))
    : undefined;

  const hasActiveFilters = statusValue || petugasValue;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {(statusValue ? 1 : 0) + (petugasValue ? 1 : 0)}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Stock Opname</DialogTitle>
          <DialogDescription>
            Saring data berdasarkan status atau petugas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={tempStatus || 'all'}
              onValueChange={(value) =>
                setTempStatus(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Petugas Filter */}
          <div className="space-y-2">
            <Label>Petugas</Label>
            <AsyncSelect
              value={tempPetugas}
              onValueChange={setTempPetugas}
              loadOptions={loadPegawaiOptions}
              placeholder="Cari Petugas..."
              initialOption={initialPetugasOption}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply}>
            Terapkan Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
