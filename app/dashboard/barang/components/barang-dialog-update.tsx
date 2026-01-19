'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateBarang } from '@/drizzle/actions/barang';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { toast } from 'sonner';

const barangSchema = z.object({
  nama: z.string().min(1, 'Nama barang wajib diisi'),
  stok: z.coerce.number().min(0, 'Stok tidak boleh kurang dari 0'),
  kategoriId: z.string().min(1, 'Kategori wajib dipilih'),
  satuanId: z.string().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z
    .string()
    .max(500, 'Spesifikasi maksimal 500 karakter')
    .optional(),
});

type BarangFormValues = z.infer<typeof barangSchema>;

interface EditBarangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barang: {
    id: number;
    nama: string;
    kodeBarang: string;
    stok: number;
    kategoriId?: number | null; // Optional because joined data might vary, but logic expects values
    satuanId?: number | null;
    kategori: string | null; // Name from join
    satuan: string | null; // Name from join
    spesifikasi: string | null;
  };
  kategoriList: { id: number; nama: string }[];
  satuanList: { id: number; nama: string }[];
}

export function BarangDialogUpdate({
  open,
  onOpenChange,
  barang,
  kategoriList,
  satuanList,
}: EditBarangDialogProps) {
  const [state, formAction, isPending] = useActionState(updateBarang, null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(barangSchema),
    values: {
      nama: barang.nama,
      stok: barang.stok,
      kategoriId: barang.kategoriId?.toString() || '',
      satuanId: barang.satuanId?.toString() || '',
      spesifikasi: barang.spesifikasi || '',
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onOpenChange(false);
    } else if (state?.success === false) {
      toast.error(state.message);
      if (state?.errors) {
        Object.keys(state.errors).forEach((key) => {
          // @ts-ignore
          setError(key, { message: state.errors[key] });
        });
      }
    }
  }, [state, onOpenChange, setError]);

  const onSubmit: SubmitHandler<BarangFormValues> = (data) => {
    const formData = new FormData();
    formData.append('id', barang.id.toString());
    formData.append('nama', data.nama);
    formData.append('stok', data.stok.toString());
    formData.append('kategoriId', data.kategoriId);
    formData.append('satuanId', data.satuanId);
    if (data.spesifikasi) formData.append('spesifikasi', data.spesifikasi);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Barang</DialogTitle>
          <DialogDescription>
            Ubah detail barang di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Kode Barang</FieldLabel>
                <Input
                  disabled
                  value={barang.kodeBarang}
                  className="bg-muted cursor-not-allowed"
                />
              </Field>
              <Field>
                <FieldLabel>Stok</FieldLabel>
                <Input type="number" {...register('stok')} min={0} />
                <FieldError errors={[{ message: errors.stok?.message }]} />
              </Field>
            </div>

            <Field>
              <FieldLabel>Nama Barang</FieldLabel>
              <Input
                {...register('nama')}
                placeholder="Contoh: Laptop Dell XPS 13"
              />
              <FieldError errors={[{ message: errors.nama?.message }]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Kategori</FieldLabel>
                <Controller
                  control={control}
                  name="kategoriId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriList.map((k) => (
                          <SelectItem key={k.id} value={k.id.toString()}>
                            {k.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  errors={[{ message: errors.kategoriId?.message }]}
                />
              </Field>

              <Field>
                <FieldLabel>Satuan</FieldLabel>
                <Controller
                  control={control}
                  name="satuanId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {satuanList.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[{ message: errors.satuanId?.message }]} />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                Spesifikasi
                <span className="text-muted-foreground text-xs -ml-1">
                  (Max 500 Karakter)
                </span>
              </FieldLabel>
              <Textarea
                {...register('spesifikasi')}
                placeholder="Detail spesifikasi barang (opsional)"
              />
              <FieldError errors={[{ message: errors.spesifikasi?.message }]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
