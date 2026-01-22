'use client';

import * as React from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { AsyncSelect } from '@/components/ui/async-select';
import { searchPihakKetiga } from '@/drizzle/data/pihak-ketiga';
import { type DateRange } from 'react-day-picker';

interface FilterState {
  startDate?: Date;
  endDate?: Date;
  pihakKetiga?: number;
}

interface RiwayatHargaFilterDialogProps {
  startDate?: Date;
  endDate?: Date;
  selectedPihakKetiga?: number;
  initialPihakKetiga?: { id: number; nama: string };
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function RiwayatHargaFilterDialog({
  startDate,
  endDate,
  selectedPihakKetiga,
  initialPihakKetiga,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
}: RiwayatHargaFilterDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDateRange, setTempDateRange] = React.useState<
    DateRange | undefined
  >({
    from: startDate,
    to: endDate,
  });
  const [tempPihakKetiga, setTempPihakKetiga] = React.useState<
    number | undefined
  >(selectedPihakKetiga);

  // Reset internal state when open changes
  React.useEffect(() => {
    if (open) {
      setTempDateRange({ from: startDate, to: endDate });
      setTempPihakKetiga(selectedPihakKetiga);
    }
  }, [startDate, endDate, selectedPihakKetiga, open]);

  const handleApply = () => {
    onApplyFilters({
      startDate: tempDateRange?.from,
      endDate: tempDateRange?.to,
      pihakKetiga: tempPihakKetiga,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setTempDateRange(undefined);
    setTempPihakKetiga(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative bg-background dark:bg-input/30"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Riwayat Harga</DialogTitle>
          <DialogDescription>
            Taring data riwayat harga berdasarkan kriteria berikut.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Rentang Tanggal BAST
            </Label>
            <Calendar
              mode="range"
              defaultMonth={tempDateRange?.from}
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={2}
              className="rounded-lg border w-full bg-card"
            />
          </div>

          {/* Supplier (Pihak Ketiga) */}
          <div className="space-y-2">
            <Label htmlFor="pihak-ketiga">Supplier / Pihak Ketiga</Label>
            <AsyncSelect
              loadOptions={searchPihakKetiga}
              placeholder="Cari supplier..."
              initialOption={initialPihakKetiga}
              value={tempPihakKetiga} // Use value prop if available or standard select method
              onValueChange={(value) => {
                setTempPihakKetiga(value);
              }}
              // isClearable not supported, use reset button
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Terapkan Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
