'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import {
  createStockOpnameSession,
  fetchPegawaiList,
} from '@/drizzle/actions/stock-opname';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from '@/components/ui/field';
import { AsyncSelect } from '@/components/ui/async-select';
import {
  createStockOpnameSchema,
  type CreateStockOpnameFormValues,
} from '@/lib/zod/stock-opname-schema';

interface Pegawai {
  id: number;
  nama: string;
}

interface CreateStockOpnameDialogProps {
  pegawaiList: Pegawai[];
}

export function CreateStockOpnameDialog({
  pegawaiList,
}: CreateStockOpnameDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStockOpnameFormValues>({
    resolver: zodResolver(createStockOpnameSchema) as any,
    defaultValues: {
      keterangan: '',
    },
  });

  async function onSubmit(values: CreateStockOpnameFormValues) {
    try {
      const result = await createStockOpnameSession(
        values.petugasId,
        values.keterangan || undefined
      );

      if (result.success) {
        toast.success('Sesi Stock Opname berhasil dibuat');
        setOpen(false);
        reset();
        if (result.data?.id) {
          router.push(`/dashboard/stock-opname/${result.data.id}`);
        }
      } else {
        toast.error(result.error || 'Gagal membuat sesi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  }

  const loadPegawaiOptions = async (query: string) => {
    const result = await fetchPegawaiList(query);
    return result.data || [];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Buat Stock Opname
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Sesi Stock Opname Baru</DialogTitle>
          <DialogDescription>
            Sesi baru akan mengambil snapshot stok sistem saat ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Petugas</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="petugasId"
                render={({ field }) => (
                  <AsyncSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    loadOptions={loadPegawaiOptions}
                    placeholder="Cari Petugas..."
                    // Pre-population logic if needed, but initial list from props can be used
                    // For create dialog, usually starts empty.
                  />
                )}
              />
            </FieldContent>
            <FieldError errors={[errors.petugasId]} />
          </Field>

          <Field>
            <FieldLabel>Keterangan</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Catatan tambahan (opsional)"
                {...register('keterangan')}
              />
            </FieldContent>
            <FieldError errors={[errors.keterangan]} />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Membuat...' : 'Buat Sesi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
