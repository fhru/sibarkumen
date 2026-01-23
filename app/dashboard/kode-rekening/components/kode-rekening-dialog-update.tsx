'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateKodeRekening } from '@/drizzle/actions/kode-rekening';
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
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { toast } from 'sonner';

import { kodeRekeningSchema } from '@/lib/zod/kode-rekening-schema';

type KodeRekeningFormValues = z.infer<typeof kodeRekeningSchema>;

interface RekeningDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  rekening: {
    id: number;
    kode: string;
    uraian: string | null;
  } | null;
}

export function RekeningDialogUpdate({
  open,
  setOpen,
  rekening,
}: RekeningDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(
    updateKodeRekening,
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<KodeRekeningFormValues>({
    resolver: zodResolver(kodeRekeningSchema) as any,
    defaultValues: {
      kode: '',
      uraian: '',
    },
  });

  useEffect(() => {
    if (rekening) {
      reset({
        kode: rekening.kode,
        uraian: rekening.uraian || '',
      });
    }
  }, [rekening, reset]);

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

  const onSubmit = (data: KodeRekeningFormValues) => {
    if (!rekening) return;

    const formData = new FormData();
    formData.append('id', rekening.id.toString());
    formData.append('kode', data.kode);
    if (data.uraian) {
      formData.append('uraian', data.uraian);
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Kode Rekening</DialogTitle>
          <DialogDescription>
            Ubah data kode rekening yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Kode Rekening <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...register('kode')}
                placeholder="Contoh: 5.1.02.01"
                maxLength={50}
              />
              <FieldError errors={[{ message: errors.kode?.message }]} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>
                Uraian
                <span className="text-muted-foreground text-xs -ml-1">
                  (Max 255 Karakter)
                </span>
              </FieldLabel>
              <Textarea
                {...register('uraian')}
                placeholder="Keterangan / Uraian (opsional)"
                maxLength={255}
              />
              <FieldError errors={[{ message: errors.uraian?.message }]} />
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
