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

interface MutasiFilterDialogProps {
  jenisMutasiValue: string | undefined;
  startDate?: Date;
  endDate?: Date;
  onApplyFilters: (filters: {
    jenisMutasi: string | undefined;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

export function MutasiFilterDialog({
  jenisMutasiValue,
  startDate,
  endDate,
  onApplyFilters,
}: MutasiFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempJenisMutasi, setTempJenisMutasi] = useState<string | undefined>(
    jenisMutasiValue,
  );
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempJenisMutasi(jenisMutasiValue);
      setTempDateRange({ from: startDate, to: endDate });
    }
    setOpen(nextOpen);
  };

  const handleApply = () => {
    onApplyFilters({
      jenisMutasi: tempJenisMutasi,
      startDate: tempDateRange?.from,
      endDate: tempDateRange?.to,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setTempJenisMutasi(undefined);
    setTempDateRange(undefined);
  };

  const activeCount = [jenisMutasiValue, startDate, endDate].filter(
    Boolean,
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-background dark:bg-input/30">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Data Mutasi Barang</DialogTitle>
          <DialogDescription>
            Pilih filter untuk menyaring data mutasi sesuai kebutuhan Anda.
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
          <div className="space-y-2">
            <Label htmlFor="jenisMutasi">Jenis Mutasi</Label>
            <Select
              value={tempJenisMutasi || "all"}
              onValueChange={(value) =>
                setTempJenisMutasi(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger id="jenisMutasi" className="w-full">
                <SelectValue placeholder="Pilih jenis mutasi" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="MASUK">Masuk</SelectItem>
                <SelectItem value="KELUAR">Keluar</SelectItem>
                <SelectItem value="PENYESUAIAN">Penyesuaian</SelectItem>
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
