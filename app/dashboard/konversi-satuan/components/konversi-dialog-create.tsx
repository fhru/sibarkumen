'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createKonversiSatuan } from '@/drizzle/actions/konversi-satuan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { Plus, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const konversiSchema = z.object({
  barangId: z.string().min(1, 'Barang harus dipilih'),
  satuanBesarId: z.string().min(1, 'Satuan Besar harus dipilih'),
  satuanKecilId: z.string().min(1, 'Satuan Kecil harus dipilih'),
  nilaiKonversi: z.coerce
    .number()
    .int('Nilai konversi harus berupa angka bulat')
    .min(1, 'Nilai konversi minimal 1'),
});

type KonversiFormValues = z.infer<typeof konversiSchema>;

interface Option {
  id: number;
  nama: string;
}

interface KonversiDialogCreateProps {
  barangList: Option[];
  satuanList: Option[];
}

export function KonversiDialogCreate({
  barangList,
  satuanList,
}: KonversiDialogCreateProps) {
  const [open, setOpen] = useState(false);
  const [openBarang, setOpenBarang] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createKonversiSatuan,
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<KonversiFormValues>({
    resolver: zodResolver(konversiSchema) as any,
    defaultValues: {
      barangId: '',
      satuanBesarId: '',
      satuanKecilId: '',
      nilaiKonversi: 1,
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
          const errorMessage = (state.errors as any)?.[key]?.[0];
          if (errorMessage) {
            setError(key as any, { message: errorMessage });
          }
        });
      }
    }
  }, [state, reset, setError]);

  const onSubmit = (data: KonversiFormValues) => {
    const formData = new FormData();
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
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Konversi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Tambah Konversi Baru</DialogTitle>
          <DialogDescription>
            Tentukan aturan konversi satuan untuk barang.
          </DialogDescription>
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
                  <Popover open={openBarang} onOpenChange={setOpenBarang}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBarang}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? barangList.find(
                              (item) => item.id.toString() === field.value
                            )?.nama
                          : 'Pilih barang...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari barang..." />
                        <CommandList>
                          <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {barangList.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.nama}
                                onSelect={() => {
                                  field.onChange(item.id.toString());
                                  setOpenBarang(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    item.id.toString() === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {item.nama}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
