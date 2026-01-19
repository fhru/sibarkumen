'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateUser } from '@/drizzle/actions/users';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama wajib diisi'),
  role: z.string().min(1, 'Role wajib diisi'),
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof updateUserSchema>;

interface UserDialogEditProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: { id: string; name: string; email: string; role: string | null } | null;
}

export function UserDialogEdit({ open, setOpen, user }: UserDialogEditProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(updateUser, null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      id: '',
      name: '',
      role: 'user',
      password: '',
    },
  });

  // Watch role to control select value
  const roleValue = watch('role');

  useEffect(() => {
    if (user && open) {
      reset({
        id: user.id,
        name: user.name,
        role: user.role || 'user',
        password: '',
      });
    }
  }, [user, open, reset]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
      reset(); // Clear password field specifically
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

  const onSubmit = (data: UserFormValues) => {
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('role', data.role);
    if (data.password) {
      formData.append('password', data.password);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Ubah detail user <strong>{user?.name}</strong>. Kosongkan password
            jika tidak ingin mengubahnya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input type="hidden" {...register('id')} />

          <FieldGroup>
            <Field>
              <FieldLabel>User Email</FieldLabel>
              <Input value={user?.email || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">
                Email tidak dapat diubah.
              </p>
            </Field>

            <Field>
              <FieldLabel>
                Nama Lengkap <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...register('name')} placeholder="Contoh: John Doe" />
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={roleValue}
                onValueChange={(val) => setValue('role', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="pegawai">Pegawai</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[{ message: errors.role?.message }]} />
            </Field>

            <Field>
              <FieldLabel>
                Password Baru{' '}
                <span className="text-muted-foreground font-normal">
                  (Opsional)
                </span>
              </FieldLabel>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Isi hanya jika ingin mereset password user ini.
              </p>
              <FieldError errors={[{ message: errors.password?.message }]} />
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
