'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Filter, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { AsyncSelect } from '@/components/ui/async-select';
import { searchPihakKetiga, searchPegawai } from '@/drizzle/actions/search';
import { type DateRange } from 'react-day-picker';

interface FilterOption {
  id: string;
  nama: string;
}

interface BastMasukFilterDialogProps {
  // Filter values
  startDate?: Date;
  endDate?: Date;
  selectedPihakKetiga?: number;
  selectedPptk?: number;
  selectedAsalPembelian?: string;
  selectedRekening?: string;

  // Initial options for AsyncSelect (to show labels)
  initialPihakKetiga?: { id: number; nama: string };
  initialPptk?: { id: number; nama: string };

  // Options (only for non-async selects)
  asalPembelianOptions: FilterOption[];
  rekeningOptions: FilterOption[];

  // Handlers
  onApplyFilters: (filters: {
    startDate?: Date;
    endDate?: Date;
    pihakKetiga?: number;
    pptk?: number;
    asalPembelian?: string;
    rekening?: string;
  }) => void;
  onClearFilters: () => void;

  // State
  hasActiveFilters: boolean;
}

export function BastMasukFilterDialog({
  startDate,
  endDate,
  selectedPihakKetiga,
  selectedPptk,
  selectedAsalPembelian,
  selectedRekening,
  initialPihakKetiga,
  initialPptk,
  asalPembelianOptions,
  rekeningOptions,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
}: BastMasukFilterDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Local state for filter values
  const [localDateRange, setLocalDateRange] = React.useState<
    DateRange | undefined
  >({
    from: startDate,
    to: endDate,
  });
  const [localPihakKetiga, setLocalPihakKetiga] = React.useState<
    number | undefined
  >(selectedPihakKetiga);
  const [localPptk, setLocalPptk] = React.useState<number | undefined>(
    selectedPptk
  );
  const [localAsalPembelian, setLocalAsalPembelian] = React.useState<
    string | undefined
  >(selectedAsalPembelian);
  const [localRekening, setLocalRekening] = React.useState<string | undefined>(
    selectedRekening
  );

  // Sync local state with props when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalDateRange({ from: startDate, to: endDate });
      setLocalPihakKetiga(selectedPihakKetiga);
      setLocalPptk(selectedPptk);
      setLocalAsalPembelian(selectedAsalPembelian);
      setLocalRekening(selectedRekening);
    }
  }, [
    open,
    startDate,
    endDate,
    selectedPihakKetiga,
    selectedPptk,
    selectedAsalPembelian,
    selectedRekening,
  ]);

  const handleApplyFilters = () => {
    onApplyFilters({
      startDate: localDateRange?.from,
      endDate: localDateRange?.to,
      pihakKetiga: localPihakKetiga,
      pptk: localPptk,
      asalPembelian: localAsalPembelian,
      rekening: localRekening,
    });
    setOpen(false);
  };

  const handleResetFilters = () => {
    setLocalDateRange(undefined);
    setLocalPihakKetiga(undefined);
    setLocalPptk(undefined);
    setLocalAsalPembelian(undefined);
    setLocalRekening(undefined);
    onClearFilters();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {
                [
                  startDate,
                  endDate,
                  selectedPihakKetiga,
                  selectedPptk,
                  selectedAsalPembelian,
                  selectedRekening,
                ].filter(Boolean).length
              }
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter BAST Masuk</DialogTitle>
          <DialogDescription>
            Pilih kriteria filter untuk menyaring data BAST Masuk
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Rentang Tanggal</Label>
            <Calendar
              mode="range"
              defaultMonth={localDateRange?.from}
              selected={localDateRange}
              onSelect={setLocalDateRange}
              numberOfMonths={2}
              className="rounded-lg border w-full bg-card"
            />
          </div>

          {/* Pihak Ketiga */}
          <div className="space-y-2">
            <Label htmlFor="pihak-ketiga">Pihak Ketiga</Label>
            <AsyncSelect
              value={localPihakKetiga}
              onValueChange={setLocalPihakKetiga}
              initialOption={initialPihakKetiga}
              loadOptions={async (query) => {
                const results = await searchPihakKetiga(query);
                return results.map((item) => ({
                  id: item.id,
                  nama: item.nama,
                }));
              }}
              placeholder="Pilih Pihak Ketiga"
            />
          </div>

          {/* PPTK/PPK */}
          <div className="space-y-2">
            <Label htmlFor="pptk">PPTK/PPK</Label>
            <AsyncSelect
              value={localPptk}
              onValueChange={setLocalPptk}
              initialOption={initialPptk}
              loadOptions={async (query) => {
                const results = await searchPegawai(query);
                return results.map((item) => ({
                  id: item.id,
                  nama: `${item.nama} ${item.nip ? `(${item.nip})` : ''}`,
                }));
              }}
              placeholder="Pilih PPTK/PPK"
            />
          </div>

          {/* Asal Pembelian */}
          <div className="space-y-2">
            <Label htmlFor="asal-pembelian">Asal Pembelian</Label>
            <Select
              value={localAsalPembelian || 'all'}
              onValueChange={(value) =>
                setLocalAsalPembelian(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="asal-pembelian" className="w-full">
                <SelectValue placeholder="Pilih Asal Pembelian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Asal Pembelian</SelectItem>
                {asalPembelianOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rekening */}
          <div className="space-y-2">
            <Label htmlFor="rekening">Rekening</Label>
            <Select
              value={localRekening || 'all'}
              onValueChange={(value) =>
                setLocalRekening(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="rekening" className="w-full">
                <SelectValue placeholder="Pilih Rekening" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rekening</SelectItem>
                {rekeningOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleResetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          )}
          <Button onClick={handleApplyFilters}>Terapkan Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
