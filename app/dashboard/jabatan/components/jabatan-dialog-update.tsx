'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateJabatan } from '@/drizzle/actions/jabatan';
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

const jabatanSchema = z.object({
  nama: z.string().min(1, 'Nama jabatan wajib diisi'),
});

type JabatanFormValues = z.infer<typeof jabatanSchema>;

interface JabatanDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  jabatan: { id: number; nama: string } | null;
}

export function JabatanDialogUpdate({
  open,
  setOpen,
  jabatan,
}: JabatanDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(updateJabatan, null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<JabatanFormValues>({
    resolver: zodResolver(jabatanSchema) as any,
    defaultValues: {
      nama: '',
    },
  });

  useEffect(() => {
    if (jabatan) {
      reset({
        nama: jabatan.nama,
      });
    }
  }, [jabatan, reset]);

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

  const onSubmit = (data: JabatanFormValues) => {
    if (!jabatan) return;

    const formData = new FormData();
    formData.append('id', jabatan.id.toString());
    formData.append('nama', data.nama);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Jabatan</DialogTitle>
          <DialogDescription>
            Ubah nama jabatan yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Jabatan <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...register('nama')} placeholder="Contoh: Staff Gudang" />
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
