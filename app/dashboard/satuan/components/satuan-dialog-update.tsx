'use client';

import { useActionState, useEffect, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateSatuan } from '@/drizzle/actions/satuan';
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

const satuanSchema = z.object({
  nama: z.string().min(1, 'Nama satuan wajib diisi'),
});

type SatuanFormValues = z.infer<typeof satuanSchema>;

interface SatuanDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  satuan: {
    id: number;
    nama: string;
  };
}

export function SatuanDialogUpdate({
  open,
  setOpen,
  satuan,
}: SatuanDialogUpdateProps) {
  const [state, formAction, isPending] = useActionState(updateSatuan, null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<SatuanFormValues>({
    resolver: zodResolver(satuanSchema),
    defaultValues: {
      nama: satuan.nama,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nama: satuan.nama,
      });
    }
  }, [open, satuan, reset]);

  useEffect(() => {
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

  const onSubmit = (data: SatuanFormValues) => {
    const formData = new FormData();
    formData.append('id', satuan.id.toString());
    formData.append('nama', data.nama);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Satuan</DialogTitle>
          <DialogDescription>
            Ubah detail satuan di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>
                Nama Satuan <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...register('nama')} placeholder="Contoh: Pcs" />
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
