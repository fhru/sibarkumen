'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createKodeRekening } from '@/drizzle/actions/kode-rekening';
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

import { kodeRekeningSchema } from '@/lib/zod/kode-rekening-schema';

type KodeRekeningFormValues = z.infer<typeof kodeRekeningSchema>;

export function RekeningDialogCreate() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createKodeRekening,
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

  const onSubmit = (data: KodeRekeningFormValues) => {
    const formData = new FormData();
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
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kode Rekening
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Kode Rekening</DialogTitle>
          <DialogDescription>
            Masukkan data kode rekening baru ke dalam sistem.
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
                placeholder="Contoh: Belanja Modal Alat Tulis Kantor"
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
