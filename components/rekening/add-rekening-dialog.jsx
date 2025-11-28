'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createRekening, updateRekening, deleteRekening } from '@/app/actions/rekening';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const formSchema = z.object({
  namaBank: z.string().min(1, 'Nama Bank wajib diisi'),
  kodeBank: z.string().min(1, 'Kode Bank wajib diisi'),
  nomorRekening: z.string().min(1, 'Nomor Rekening wajib diisi'),
  namaPemilik: z.string().min(1, 'Nama Pemilik wajib diisi'),
  jenisRekening: z.string().min(1, 'Jenis Rekening wajib diisi'),
  keterangan: z.string().optional(),
});

export function AddRekeningDialog({ rekening, isEdit = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaBank: rekening?.namaBank || '',
      kodeBank: rekening?.kodeBank || '',
      nomorRekening: rekening?.nomorRekening || '',
      namaPemilik: rekening?.namaPemilik || '',
      jenisRekening: rekening?.jenisRekening || '',
      keterangan: rekening?.keterangan || '',
    },
  });

  async function onSubmit(values) {
    setLoading(true);
    try {
      let result;
      if (isEdit && rekening) {
        result = await updateRekening(rekening.id, values);
      } else {
        result = await createRekening(values);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        setOpen(false);
        if (!isEdit) form.reset();
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
      if (!rekening) return;
      setLoading(true);
      try {
          const res = await deleteRekening(rekening.id);
          if (res.success) {
              toast.success(res.message);
              setOpen(false);
          } else {
              toast.error(res.error);
          }
      } catch (e) {
          toast.error('Gagal menghapus');
      } finally {
          setLoading(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rekening
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Rekening' : 'Tambah Rekening'}</DialogTitle>
          <DialogDescription>
            Masukkan detail rekening bank.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="namaBank"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Bank</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: Bank BJB" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="kodeBank"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Kode Bank</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: 110" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="nomorRekening"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Rekening</FormLabel>
                  <FormControl>
                    <Input placeholder="1234xxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="namaPemilik"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Pemilik</FormLabel>
                    <FormControl>
                        <Input placeholder="Dinas ..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="jenisRekening"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <FormControl>
                        <Input placeholder="Giro / Tabungan" {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:justify-between">
                {isEdit && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" size="icon">
                                <Trash className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Rekening?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Hapus
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
              <div className="flex gap-2">
                 <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Batal
                 </Button>
                 <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                 </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
