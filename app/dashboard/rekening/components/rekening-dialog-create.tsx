'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createRekening } from '@/drizzle/actions/rekening';
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
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const rekeningSchema = z.object({
  namaBank: z.string().min(1, 'Nama bank wajib diisi'),
  nomorRekening: z
    .string()
    .min(1, 'Nomor rekening wajib diisi')
    .regex(
      /^[0-9]+$/,
      'Nomor rekening harus berupa angka dan tidak boleh desimal'
    ),
  namaPemilik: z.string().min(1, 'Nama pemilik wajib diisi'),
  keterangan: z
    .string()
    .max(500, 'Keterangan maksimal 500 karakter')
    .optional(),
});

type RekeningFormValues = z.infer<typeof rekeningSchema>;

export function RekeningDialogCreate() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createRekening, null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RekeningFormValues>({
    resolver: zodResolver(rekeningSchema) as any,
    defaultValues: {
      namaBank: '',
      nomorRekening: '',
      namaPemilik: '',
      keterangan: '',
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

  const onSubmit = (data: RekeningFormValues) => {
    const formData = new FormData();
    formData.append('namaBank', data.namaBank);
    formData.append('nomorRekening', data.nomorRekening);
    formData.append('namaPemilik', data.namaPemilik);
    if (data.keterangan) {
      formData.append('keterangan', data.keterangan);
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Rekening
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Rekening</DialogTitle>
          <DialogDescription>
            Masukkan data rekening baru ke dalam sistem.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>
                Nama Bank <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...register('namaBank')} placeholder="Contoh: Bank BCA" />
              <FieldError errors={[{ message: errors.namaBank?.message }]} />
            </Field>

            <Field>
              <FieldLabel>
                Nomor Rekening <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...register('nomorRekening')}
                placeholder="Contoh: 1234567890"
              />
              <FieldError
                errors={[{ message: errors.nomorRekening?.message }]}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Pemilik <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...register('namaPemilik')}
                placeholder="Contoh: PT. Maju Mundur"
              />
              <FieldError errors={[{ message: errors.namaPemilik?.message }]} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>
                Keterangan
                <span className="text-muted-foreground text-xs -ml-1">
                  (Max 500 Karakter)
                </span>
              </FieldLabel>
              <Textarea
                {...register('keterangan')}
                placeholder="Keterangan tambahan (opsional)"
              />
              <FieldError errors={[{ message: errors.keterangan?.message }]} />
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
