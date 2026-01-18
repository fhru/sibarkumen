'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateKategori } from '@/drizzle/actions/kategori';
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

const kategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori wajib diisi'),
});

type KategoriFormValues = z.infer<typeof kategoriSchema>;

interface KategoriDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  kategori: {
    id: number;
    nama: string;
  };
}

export function KategoriDialogUpdate({
  open,
  setOpen,
  kategori,
}: KategoriDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(updateKategori, null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<KategoriFormValues>({
    resolver: zodResolver(kategoriSchema),
    defaultValues: {
      nama: kategori.nama,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nama: kategori.nama,
      });
    }
  }, [open, kategori, reset]);

  useEffect(() => {
    console.log('state', state);
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state?.success === false) {
      toast.error(state.message);
      if (state?.errors) {
        Object.keys(state.errors).forEach((key) => {
          // @ts-ignore
          setError(key, { message: state.errors[key] });
        });
      }
    }
  }, [state, setOpen, setError]);

  const onSubmit = (data: KategoriFormValues) => {
    const formData = new FormData();
    formData.append('id', kategori.id.toString());
    formData.append('nama', data.nama);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
          <DialogDescription>
            Ubah detail kategori di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Kategori <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...register('nama')} placeholder="Contoh: Elektronik" />
              <FieldError errors={[{ message: errors.nama?.message }]} />
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
