'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPegawai, getAvailableUsers } from '@/drizzle/actions/pegawai';
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

import { pegawaiSchema } from '@/lib/zod/pegawai';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PegawaiFormValues = z.infer<typeof pegawaiSchema>;

export function PegawaiDialogCreate() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
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
    if (open) {
      getAvailableUsers().then(setUsers);
    }
  }, [open]);

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
    if (data.userId) {
      formData.append('userId', data.userId);
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
              <Input
                {...register('nama')}
                placeholder="Nama Lengkap"
                maxLength={100}
              />
              <FieldError errors={[{ message: errors.nama?.message }]} />
            </Field>

            <Field>
              <FieldLabel>NIP</FieldLabel>
              <Input
                {...register('nip')}
                placeholder="Nomor Induk Pegawai"
                maxLength={50}
              />
              <FieldError errors={[{ message: errors.nip?.message }]} />
            </Field>

            <Field>
              <FieldLabel>
                Hubungkan Akun User{' '}
                <span className="text-muted-foreground font-normal">
                  (Opsional)
                </span>
              </FieldLabel>
              <Select
                name="userId"
                onValueChange={(val) =>
                  register('userId').onChange({
                    target: { value: val, name: 'userId' },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun user" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Tidak ada user tersedia
                    </div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FieldError errors={[{ message: errors.userId?.message }]} />
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
