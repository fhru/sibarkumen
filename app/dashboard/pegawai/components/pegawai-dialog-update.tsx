'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updatePegawai, getAvailableUsers } from '@/drizzle/actions/pegawai';
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { pegawaiSchema } from '@/lib/zod/pegawai';

type PegawaiFormValues = z.infer<typeof pegawaiSchema>;

interface PegawaiDialogUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pegawai: {
    id: number;
    nama: string;
    nip: string | null;
    userId: string | null;
  } | null;
}

export function PegawaiDialogUpdate({
  open,
  setOpen,
  pegawai,
}: PegawaiDialogUpdateProps) {
  const [users, setUsers] = useState<any[]>([]);
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
        userId: pegawai.userId || '',
      });
    }
  }, [pegawai, reset]);

  useEffect(() => {
    if (open && pegawai) {
      // Fetch users, considering the current linked user
      getAvailableUsers(pegawai.userId).then(setUsers);
    }
  }, [open, pegawai]);

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
    if (data.userId) {
      formData.append('userId', data.userId);
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
                defaultValue={pegawai?.userId || undefined}
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
