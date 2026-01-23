'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBarang } from '@/drizzle/actions/barang';
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
  DialogTrigger,
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
import { Plus } from 'lucide-react';

const barangSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  kategoriId: z.string().min(1, 'Kategori wajib dipilih'),
  satuanId: z.string().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z
    .string()
    .max(500, 'Spesifikasi maksimal 500 karakter')
    .optional(),
});

type BarangFormValues = z.infer<typeof barangSchema>;

interface BarangFormProps {
  kategoriList: { id: number; nama: string }[];
  satuanList: { id: number; nama: string }[];
}

export function BarangDialogCreate({
  kategoriList,
  satuanList,
}: BarangFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createBarang, null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(barangSchema),
    defaultValues: {
      nama: '',
      kategoriId: '',
      satuanId: '',
      spesifikasi: '',
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
      reset();
    } else if (state?.success === false) {
      toast.error(state.message);
      if (state?.errors) {
        Object.keys(state.errors).forEach((key) => {
          // @ts-ignore
          setError(key, { message: state.errors[key] });
        });
      }
    }
  }, [state, reset, setError]);

  const onSubmit: SubmitHandler<BarangFormValues> = (data) => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    formData.append('stok', '0');
    formData.append('kategoriId', data.kategoriId);
    formData.append('satuanId', data.satuanId);
    if (data.spesifikasi) formData.append('spesifikasi', data.spesifikasi);

    // Call server action
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Barang
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Barang Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail barang baru di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Barang <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...register('nama')}
                maxLength={255}
                placeholder="Contoh: Laptop Dell XPS 13"
              />
              <FieldError errors={[{ message: errors.nama?.message }]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  Kategori <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
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
                <FieldLabel>
                  Satuan <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
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
                maxLength={500}
                placeholder="Detail spesifikasi barang (opsional)"
              />
              <FieldError errors={[{ message: errors.spesifikasi?.message }]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Barang'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
