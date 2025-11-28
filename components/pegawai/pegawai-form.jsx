'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createPegawai, updatePegawai } from '@/app/actions/pegawai';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const formSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  nip: z.string().min(1, 'NIP harus diisi'),
  jabatan: z.string().min(1, 'Jabatan harus diisi'),
  unitKerja: z.string().min(1, 'Unit Kerja harus diisi'),
  keterangan: z.string().optional(),
});

export function PegawaiForm({ initialData, onSuccess }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        keterangan: initialData.keterangan ?? '',
    } : {
      nama: '',
      nip: '',
      jabatan: '',
      unitKerja: '',
      keterangan: '',
    },
  });

  async function onSubmit(values) {
    setIsPending(true);
    try {
      let result;
      if (initialData) {
        result = await updatePegawai(initialData.id, values);
      } else {
        result = await createPegawai(values);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        form.reset();
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (e) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: 19900101..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Pegawai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="jabatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jabatan</FormLabel>
                <FormControl>
                   <Input placeholder="Staf Pelaksana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="unitKerja"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Kerja</FormLabel>
                <FormControl>
                  <Input placeholder="Bagian Umum" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Simpan Perubahan' : 'Tambah Pegawai'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
