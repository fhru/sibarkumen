'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateAsalPembelian } from '@/drizzle/actions/asal-pembelian';
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

import { asalPembelianSchema } from '@/lib/zod/asal-pembelian';

type AsalPembelianFormValues = z.infer<typeof asalPembelianSchema>;

interface AsalPembelianDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  asalPembelian: { id: number; nama: string } | null;
}

export function AsalPembelianDialogUpdate({
  open,
  setOpen,
  asalPembelian,
}: AsalPembelianDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(
    updateAsalPembelian,
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AsalPembelianFormValues>({
    resolver: zodResolver(asalPembelianSchema) as any,
    defaultValues: {
      nama: '',
    },
  });

  useEffect(() => {
    if (asalPembelian) {
      reset({
        nama: asalPembelian.nama,
      });
    }
  }, [asalPembelian, reset]);

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

  const onSubmit = (data: AsalPembelianFormValues) => {
    if (!asalPembelian) return;

    const formData = new FormData();
    formData.append('id', asalPembelian.id.toString());
    formData.append('nama', data.nama);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Asal Pembelian</DialogTitle>
          <DialogDescription>
            Ubah nama asal pembelian yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Asal Pembelian{' '}
                <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...register('nama')}
                placeholder="Contoh: Toko ABC"
                maxLength={100}
              />
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
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
