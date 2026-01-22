"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";

interface SPBFilterDialogProps {
  statusValue: string | undefined;
  isPrintedValue: string | undefined;
  startDate?: Date;
  endDate?: Date;
  onApplyFilters: (filters: {
    status: string | undefined;
    isPrinted: string | undefined;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export function SPBFilterDialog({
  statusValue,
  isPrintedValue,
  startDate,
  endDate,
  onApplyFilters,
}: SPBFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string | undefined>(statusValue);
  const [tempIsPrinted, setTempIsPrinted] = useState<string | undefined>(
    isPrintedValue,
  );
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempStatus(statusValue);
      setTempIsPrinted(isPrintedValue);
      setTempDateRange({ from: startDate, to: endDate });
    }
    setOpen(nextOpen);
  };

  const handleApply = () => {
    onApplyFilters({
      status: tempStatus,
      isPrinted: tempIsPrinted,
      startDate: tempDateRange?.from,
      endDate: tempDateRange?.to,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setTempStatus(undefined);
    setTempIsPrinted(undefined);
    setTempDateRange(undefined);
  };

  const hasActiveFilters =
    statusValue || isPrintedValue || startDate || endDate;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-background dark:bg-input/30">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {
                [statusValue, isPrintedValue, startDate, endDate].filter(
                  Boolean,
                ).length
              }
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Data SPB</DialogTitle>
          <DialogDescription>
            Pilih filter untuk menyaring data SPB sesuai kebutuhan Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Rentang Tanggal</Label>
            <Calendar
              mode="range"
              defaultMonth={tempDateRange?.from}
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={2}
              className="rounded-lg border w-full bg-card"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status SPB</Label>
            <Select
              value={tempStatus || "all"}
              onValueChange={(value) =>
                setTempStatus(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="MENUNGGU_SPPB">Menunggu SPPB</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
                <SelectItem value="BATAL">Batal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Is Printed Filter */}
          <div className="space-y-2">
            <Label htmlFor="isPrinted">Status Cetak</Label>
            <Select
              value={tempIsPrinted || "all"}
              onValueChange={(value) =>
                setTempIsPrinted(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger id="isPrinted" className="w-full">
                <SelectValue placeholder="Pilih status cetak" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">Semua Status Cetak</SelectItem>
                <SelectItem value="true">Sudah Dicetak</SelectItem>
                <SelectItem value="false">Belum Dicetak</SelectItem>
              </SelectContent>
            </Select>
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
