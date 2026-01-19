'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updatePegawai } from '@/drizzle/actions/pegawai';
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
import { toast } from 'sonner';

const pegawaiSchema = z.object({
  nama: z.string().min(1, 'Nama pegawai wajib diisi'),
  nip: z
    .string()
    .regex(/^[0-9]*$/, 'NIP harus berupa angka dan tidak boleh desimal')
    .optional(),
});

type PegawaiFormValues = z.infer<typeof pegawaiSchema>;

interface PegawaiDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pegawai: { id: number; nama: string; nip: string | null } | null;
}

export function PegawaiDialogUpdate({
  open,
  setOpen,
  pegawai,
}: PegawaiDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(updatePegawai, null);

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
    if (pegawai) {
      reset({
        nama: pegawai.nama,
        nip: pegawai.nip || '',
      });
    }
  }, [pegawai, reset]);

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
  }, [state, reset, setError, setOpen]);

  const onSubmit = (data: PegawaiFormValues) => {
    if (!pegawai) return;

    const formData = new FormData();
    formData.append('id', pegawai.id.toString());
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pegawai</DialogTitle>
          <DialogDescription>
            Ubah data pegawai yang sudah ada.
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
