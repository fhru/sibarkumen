'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAllPegawai } from '@/app/actions/pegawai';
import { getBarangList } from '@/app/actions/barang';
import { createSpb } from '@/app/actions/spb';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  nomorSpb: z.string().optional(),
  tanggalSpb: z.string().min(1, 'Tanggal wajib diisi'),
  pemohonId: z.string().min(1, 'Pemohon wajib dipilih'),
  keterangan: z.string().optional(),
  details: z.array(z.object({
      idBarang: z.string().min(1, 'Pilih Barang'),
      jumlah: z.coerce.number().min(1),
  })).min(1, 'Minimal satu barang'),
});

export function SpbForm() {
  const [isPending, setIsPending] = useState(false);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const router = useRouter();

  useEffect(() => {
      Promise.all([
          getAllPegawai(),
          getBarangList({ limit: 1000 })
      ]).then(([pegawai, barangRes]) => {
          setPegawaiList(pegawai);
          setBarangList(barangRes.data || []);
      });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomorSpb: '',
      tanggalSpb: new Date().toISOString().split('T')[0],
      pemohonId: '',
      keterangan: '',
      details: [{ idBarang: '', jumlah: 1 }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  async function onSubmit(values) {
    setIsPending(true);
    
    const payload = {
        ...values,
        pemohonId: parseInt(values.pemohonId),
        details: values.details.map(d => ({
            idBarang: parseInt(d.idBarang),
            jumlah: d.jumlah,
        }))
    };

    const result = await createSpb(payload);

    if (result.error) {
        toast.error(result.error);
    } else {
        toast.success('Permintaan Barang Berhasil Dibuat');
        router.push('/dashboard/spb'); // Or spb-saya depending on role, but this generic form redirects to generic list for now
    }
    setIsPending(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <Card>
            <CardHeader><CardTitle>Detail Permintaan</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="nomorSpb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nomor SPB</FormLabel>
                        <FormControl><Input placeholder="Otomatis di-generate sistem" readOnly {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tanggalSpb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanggal Permintaan</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="pemohonId"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Pemohon (Pegawai)</FormLabel>
                        <PegawaiCombobox options={pegawaiList} value={field.value} onChange={field.onChange} />
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Keterangan / Keperluan</FormLabel>
                        <FormControl><Input placeholder="Untuk kegiatan..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Barang yang Diminta</CardTitle>
                <Button type="button" size="sm" onClick={() => append({ idBarang: '', jumlah: 1 })}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Item
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-4 border-b pb-4">
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name={`details.${index}.idBarang`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Nama Barang</FormLabel>
                                        <ItemCombobox options={barangList} value={field.value} onChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-32">
                            <FormField
                                control={form.control}
                                name={`details.${index}.jumlah`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Jumlah</FormLabel>
                                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="mb-0.5" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                {form.formState.errors.details && (
                    <p className="text-sm text-destructive">{form.formState.errors.details.message}</p>
                )}
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Permintaan
            </Button>
        </div>
      </form>
    </Form>
  );
}

function ItemCombobox({ options, value, onChange }) {
    const [open, setOpen] = useState(false)
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !value && "text-muted-foreground")}
          >
            {value
              ? options.find((item) => String(item.id) === value)?.namaBarang
              : "Pilih Barang..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Cari barang..." />
            <CommandList>
              <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.namaBarang}
                    onSelect={() => {
                      onChange(String(item.id))
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === String(item.id) ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                        <span>{item.namaBarang}</span>
                        <span className="text-xs text-muted-foreground">Stok: {item.stokTersedia} {item.satuan}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
}

function PegawaiCombobox({ options, value, onChange }) {
    const [open, setOpen] = useState(false)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !value && "text-muted-foreground")}
          >
            {value ? options.find((item) => String(item.id) === value)?.nama : "Pilih Pegawai..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Cari pegawai..." />
            <CommandList>
              <CommandEmpty>Pegawai tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.nama}
                    onSelect={() => {
                      onChange(String(item.id))
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === String(item.id) ? "opacity-100" : "opacity-0")} />
                    {item.nama}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
}
