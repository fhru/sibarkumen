'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPegawai } from '@/drizzle/actions/pegawai';
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
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const pegawaiSchema = z.object({
  nama: z.string().min(1, 'Nama pegawai wajib diisi'),
  nip: z
    .string()
    .regex(/^[0-9]*$/, 'NIP harus berupa angka dan tidak boleh desimal')
    .optional(),
});

type PegawaiFormValues = z.infer<typeof pegawaiSchema>;

export function PegawaiDialogCreate() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createPegawai, null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PegawaiFormValues>({
    resolver: zodResolver(pegawaiSchema) as any,
    defaultValues: {
      nama: '',
      nip: '',
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

  const onSubmit = (data: PegawaiFormValues) => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    if (data.nip) {
      formData.append('nip', data.nip);
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pegawai</DialogTitle>
          <DialogDescription>
            Masukkan data pegawai baru ke dalam sistem.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Pegawai <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...register('nama')} placeholder="Nama Lengkap" />
              <FieldError errors={[{ message: errors.nama?.message }]} />
            </Field>

            <Field>
              <FieldLabel>NIP</FieldLabel>
              <Input {...register('nip')} placeholder="Nomor Induk Pegawai" />
              <FieldError errors={[{ message: errors.nip?.message }]} />
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
