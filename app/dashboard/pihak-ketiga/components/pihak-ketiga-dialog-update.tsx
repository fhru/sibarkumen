'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updatePihakKetiga } from '@/drizzle/actions/pihak-ketiga';
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

import { pihakKetigaSchema } from '@/lib/zod/pihak-ketiga';

type PihakKetigaFormValues = z.infer<typeof pihakKetigaSchema>;

interface PihakKetigaDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pihakKetiga: { id: number; nama: string } | null;
}

export function PihakKetigaDialogUpdate({
  open,
  setOpen,
  pihakKetiga,
}: PihakKetigaDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(
    updatePihakKetiga,
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PihakKetigaFormValues>({
    resolver: zodResolver(pihakKetigaSchema) as any,
    defaultValues: {
      nama: '',
    },
  });

  useEffect(() => {
    if (pihakKetiga) {
      reset({
        nama: pihakKetiga.nama,
      });
    }
  }, [pihakKetiga, reset]);

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

  const onSubmit = (data: PihakKetigaFormValues) => {
    if (!pihakKetiga) return;

    const formData = new FormData();
    formData.append('id', pihakKetiga.id.toString());
    formData.append('nama', data.nama);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pihak Ketiga</DialogTitle>
          <DialogDescription>
            Ubah nama pihak ketiga yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Pihak Ketiga <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...register('nama')}
                placeholder="Contoh: PT. Maju Jaya"
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
