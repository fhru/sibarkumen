'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';

interface BarangDialogDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barang: {
    nama: string;
    kodeBarang: string;
    stok: number;
    kategori: string | null;
    satuan: string | null;
    spesifikasi: string | null;
  };
}

export function BarangDialogDetail({
  open,
  onOpenChange,
  barang,
}: BarangDialogDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detail Barang</DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai barang ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Kode Barang</FieldLabel>
                <Input
                  value={barang.kodeBarang}
                  readOnly
                  className="bg-muted"
                />
              </Field>
              <Field>
                <FieldLabel>Stok</FieldLabel>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background">
                  {barang.stok} {barang.satuan}
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel>Nama Barang</FieldLabel>
              <Input value={barang.nama} readOnly className="bg-muted" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Kategori</FieldLabel>
                <Input
                  value={barang.kategori || '-'}
                  readOnly
                  className="bg-muted"
                />
              </Field>

              <Field>
                <FieldLabel>Satuan</FieldLabel>
                <Input
                  value={barang.satuan || '-'}
                  readOnly
                  className="bg-muted"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Spesifikasi</FieldLabel>
              <Textarea
                value={barang.spesifikasi || '-'}
                readOnly
                className="bg-muted min-h-[100px]"
              />
            </Field>
          </FieldGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
