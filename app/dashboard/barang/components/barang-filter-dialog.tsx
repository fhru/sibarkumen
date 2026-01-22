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
import { Checkbox } from "@/components/ui/checkbox";

interface BarangFilterDialogProps {
  statusValue: string | undefined;
  categoryOptions: { label: string; value: string }[];
  selectedCategories: string[];
  onApplyFilters: (status: string | undefined, categories: string[]) => void;
}

export function BarangFilterDialog({
  statusValue,
  categoryOptions,
  selectedCategories,
  onApplyFilters,
}: BarangFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string | undefined>(statusValue);
  const [tempCategories, setTempCategories] =
    useState<string[]>(selectedCategories);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempStatus(statusValue);
      setTempCategories(selectedCategories);
    }
    setOpen(nextOpen);
  };

  const handleApply = () => {
    console.log("Applying filters:", { tempStatus, tempCategories });
    onApplyFilters(tempStatus, tempCategories);
    setOpen(false);
  };

  const handleReset = () => {
    setTempStatus(undefined);
    setTempCategories([]);
  };

  const handleCategoryToggle = (categoryValue: string) => {
    setTempCategories((prev) =>
      prev.includes(categoryValue)
        ? prev.filter((v) => v !== categoryValue)
        : [...prev, categoryValue],
    );
  };

  const hasActiveFilters = statusValue || selectedCategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {(statusValue ? 1 : 0) + selectedCategories.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Data Barang</DialogTitle>
          <DialogDescription>
            Pilih filter untuk menyaring data barang sesuai kebutuhan Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status Stok</Label>
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
                <SelectItem value="available">Tersedia</SelectItem>
                <SelectItem value="low">Stok Menipis</SelectItem>
                <SelectItem value="out">Habis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <div className="max-h-50 overflow-y-auto rounded-md border p-4 space-y-3">
              {categoryOptions.length > 0 ? (
                categoryOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${option.value}`}
                      checked={tempCategories.includes(option.value)}
                      onCheckedChange={() => handleCategoryToggle(option.value)}
                    />
                    <label
                      htmlFor={`category-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada kategori tersedia
                </p>
              )}
            </div>
            {tempCategories.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {tempCategories.length} kategori dipilih
              </p>
            )}
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
