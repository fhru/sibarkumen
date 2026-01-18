'use client';

import { useActionState, useEffect, startTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateKonversiSatuan } from '@/drizzle/actions/konversi-satuan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const konversiSchema = z.object({
  barangId: z.string().min(1, 'Barang harus dipilih'),
  satuanBesarId: z.string().min(1, 'Satuan Besar harus dipilih'),
  satuanKecilId: z.string().min(1, 'Satuan Kecil harus dipilih'),
  nilaiKonversi: z.coerce.number().min(1, 'Nilai konversi minimal 1'),
});

type KonversiFormValues = z.infer<typeof konversiSchema>;

interface Option {
  id: number;
  nama: string;
}

interface KonversiData {
  id: number;
  barangId: number;
  satuanBesarId: number;
  satuanKecilId: number;
  nilaiKonversi: number;
}

interface KonversiDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  konversi: KonversiData;
  barangList: Option[];
  satuanList: Option[];
}

export function KonversiDialogUpdate({
  open,
  setOpen,
  konversi,
  barangList,
  satuanList,
}: KonversiDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(
    updateKonversiSatuan,
    null
  );

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm<KonversiFormValues>({
    resolver: zodResolver(konversiSchema) as any,
    defaultValues: {
      barangId: konversi.barangId.toString(),
      satuanBesarId: konversi.satuanBesarId.toString(),
      satuanKecilId: konversi.satuanKecilId.toString(),
      nilaiKonversi: konversi.nilaiKonversi,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        barangId: konversi.barangId.toString(),
        satuanBesarId: konversi.satuanBesarId.toString(),
        satuanKecilId: konversi.satuanKecilId.toString(),
        nilaiKonversi: konversi.nilaiKonversi,
      });
    }
  }, [open, konversi, reset]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state?.success === false) {
      toast.error(state.message);
      if (state?.errors) {
        Object.keys(state.errors).forEach((key) => {
          const errorMessage = (state.errors as any)?.[key]?.[0];
          if (errorMessage) {
            setError(key as any, { message: errorMessage });
          }
        });
      }
    }
  }, [state, setOpen, setError]);

  const onSubmit = (data: KonversiFormValues) => {
    const formData = new FormData();
    formData.append('id', konversi.id.toString());
    formData.append('barangId', data.barangId);
    formData.append('satuanBesarId', data.satuanBesarId);
    formData.append('satuanKecilId', data.satuanKecilId);
    formData.append('nilaiKonversi', data.nilaiKonversi.toString());
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Konversi</DialogTitle>
          <DialogDescription>Ubah detail konversi satuan.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Barang <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Controller
                name="barangId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangList.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[{ message: errors.barangId?.message }]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  Satuan Besar <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Controller
                  name="satuanBesarId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {satuanList.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  errors={[{ message: errors.satuanBesarId?.message }]}
                />
              </Field>

              <Field>
                <FieldLabel>
                  Satuan Kecil <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Controller
                  name="satuanKecilId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {satuanList.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError
                  errors={[{ message: errors.satuanKecilId?.message }]}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                Nilai Konversi <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                type="number"
                min={1}
                {...register('nilaiKonversi')}
                placeholder="Contoh: 12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contoh: 1 Satuan Besar = [Nilai] Satuan Kecil
              </p>
              <FieldError
                errors={[{ message: errors.nilaiKonversi?.message }]}
              />
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
              {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
