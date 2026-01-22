'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createJabatan } from '@/drizzle/actions/jabatan';
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

const jabatanSchema = z.object({
  nama: z.string().min(1, 'Nama jabatan wajib diisi'),
  unitKerja: z.string().optional(),
});

type JabatanFormValues = z.infer<typeof jabatanSchema>;

export function JabatanDialogCreate() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createJabatan, null);

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
      unitKerja: '',
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

  const onSubmit = (data: JabatanFormValues) => {
    const formData = new FormData();
    formData.append('nama', data.nama);
    if (data.unitKerja) {
      formData.append('unitKerja', data.unitKerja);
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Jabatan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Jabatan</DialogTitle>
          <DialogDescription>Masukkan nama jabatan baru.</DialogDescription>
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

          <FieldGroup>
            <Field>
              <FieldLabel>Unit Kerja</FieldLabel>
              <Input
                {...register('unitKerja')}
                placeholder="Contoh: Divisi Logistik"
              />
              <FieldError errors={[{ message: errors.unitKerja?.message }]} />
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
