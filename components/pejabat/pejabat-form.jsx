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
import { Loader2, Check, ChevronsUpDown, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPejabat, updatePejabat, deletePejabat } from '@/app/actions/pejabat';
import { getAllPegawai } from '@/app/actions/pegawai';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  idPegawai: z.string().min(1, 'Pegawai harus dipilih'),
  jenisJabatan: z.string().min(1, 'Jenis Jabatan harus diisi'),
  nomorSk: z.string().min(1, 'Nomor SK harus diisi'),
  tanggalSk: z.string().min(1, 'Tanggal SK harus diisi'),
  keterangan: z.string().optional(),
});

export function PejabatForm({ initialData, onSuccess }) {
  const [isPending, setIsPending] = useState(false);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadPegawai = async () => {
      const list = await getAllPegawai();
      setPegawaiList(list);
    };
    loadPegawai();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          idPegawai: String(initialData.idPegawai),
          tanggalSk: initialData.tanggalSk
            ? new Date(initialData.tanggalSk).toISOString().split('T')[0]
            : '',
          keterangan: initialData.keterangan || '',
        }
      : {
          idPegawai: '',
          jenisJabatan: '',
          nomorSk: '',
          tanggalSk: '',
          keterangan: '',
        },
  });

  async function onSubmit(values) {
    setIsPending(true);

    const payload = {
      ...values,
      idPegawai: parseInt(values.idPegawai),
      tanggalSk: new Date(values.tanggalSk),
    };

    try {
      let result;
      if (initialData) {
        result = await updatePejabat(initialData.id, payload);
      } else {
        result = await createPejabat(payload);
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

  async function handleDelete() {
    if (!initialData) return;
    setIsPending(true);
    try {
        const res = await deletePejabat(initialData.id);
        if (res.success) {
            toast.success(res.message);
            if (onSuccess) onSuccess();
            router.refresh();
        } else {
            toast.error(res.error);
        }
    } catch (e) {
        toast.error('Gagal menghapus');
    } finally {
        setIsPending(false);
    }
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="idPegawai"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pilih Pegawai</FormLabel>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        disabled={!!initialData}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? pegawaiList.find(
                              (peg) => String(peg.id) === field.value
                            )?.nama
                          : 'Pilih Pegawai...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Cari pegawai..." />
                      <CommandList>
                        <CommandEmpty>Pegawai tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {pegawaiList.map((peg) => (
                            <CommandItem
                              key={peg.id}
                              value={peg.nama} // Search by name
                              onSelect={() => {
                                form.setValue('idPegawai', String(peg.id));
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === String(peg.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {peg.nama} - {peg.nip}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jenisJabatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Jabatan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Pengurus Barang, Pejabat Penatausahaan..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nomorSk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor SK</FormLabel>
                  <FormControl>
                    <Input placeholder="No. SK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggalSk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal SK</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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

        <div className="flex justify-between space-x-2 pt-4">
          {initialData && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" size="icon">
                          <Trash className="h-4 w-4" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Pejabat?</AlertDialogTitle>
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
          <div className="flex-1 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Simpan Perubahan' : 'Tambah Pejabat'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
