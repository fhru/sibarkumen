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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBastMasuk } from '@/app/actions/bast-masuk';
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
import { Check, ChevronsUpDown } from "lucide-react"

const formSchema = z.object({
  nomorBast: z.string().min(1, 'Nomor BAST wajib diisi'),
  tanggalBast: z.string().min(1, 'Tanggal wajib diisi'),
  nomorBapb: z.string().min(1, 'Nomor BAPB wajib diisi'),
  tanggalBapb: z.string().min(1, 'Tanggal BAPB wajib diisi'),
  asalPembelian: z.string().min(1, 'Asal Pembelian wajib diisi'),
  idRekening: z.string().min(1, 'Rekening wajib dipilih'),
  pptkPpkId: z.string().min(1, 'PPTK/PPK wajib dipilih'),
  pihakKetiga: z.string().optional(),
  keterangan: z.string().optional(),
  details: z.array(z.object({
      idBarang: z.string().min(1, 'Pilih Barang'),
      jumlah: z.coerce.number().min(1),
      hargaSatuan: z.coerce.number().min(0),
      totalHarga: z.coerce.number(), // Calculated
  })).min(1, 'Minimal satu barang'),
});

export function BastMasukForm({ 
  pegawaiOptions = [], 
  rekeningOptions = [], 
  barangOptions = [] 
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Data is now passed from server component
  const pegawaiList = pegawaiOptions;
  const rekeningList = rekeningOptions;
  const barangList = barangOptions;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomorBast: '',
      tanggalBast: new Date().toISOString().split('T')[0],
      nomorBapb: '',
      tanggalBapb: new Date().toISOString().split('T')[0],
      asalPembelian: '',
      idRekening: '',
      pptkPpkId: '',
      pihakKetiga: '',
      keterangan: '',
      details: [{ idBarang: '', jumlah: 1, hargaSatuan: 0, totalHarga: 0 }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // Watch for calculation
  // Ideally use useWatch, but for simplicity in this big form,
  // we can just calculate on render or useEffect if needed for display.
  // But react-hook-form handles value updates.

  async function onSubmit(values) {
    setIsPending(true);
    
    const payload = {
        ...values,
        idRekening: parseInt(values.idRekening),
        pptkPpkId: parseInt(values.pptkPpkId),
        details: values.details.map(d => ({
            idBarang: parseInt(d.idBarang),
            jumlah: d.jumlah,
            hargaSatuan: d.hargaSatuan,
            totalHarga: d.jumlah * d.hargaSatuan
        }))
    };

    const result = await createBastMasuk(payload);

    if (result.error) {
        toast.error(result.error);
    } else {
        toast.success('Transaksi Berhasil Disimpan');
        router.push('/dashboard/bast-masuk');
        router.refresh();
    }
    setIsPending(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Header Section */}
        <Card>
            <CardHeader><CardTitle>Informasi Dokumen</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="nomorBast"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nomor BAST</FormLabel>
                        <FormControl><Input placeholder="No. BAST" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tanggalBast"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanggal BAST</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nomorBapb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nomor BAPB</FormLabel>
                        <FormControl><Input placeholder="No. BAPB" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tanggalBapb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanggal BAPB</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="asalPembelian"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Asal Pembelian</FormLabel>
                        <FormControl><Input placeholder="Contoh: APBD 2024" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pihakKetiga"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pihak Ketiga (Toko/CV/PT)</FormLabel>
                        <FormControl><Input placeholder="Nama Vendor" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pptkPpkId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>PPTK / PPK</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Pilih Pegawai" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {pegawaiList.map((peg) => (
                                <SelectItem key={peg.id} value={String(peg.id)}>{peg.nama}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="idRekening"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rekening Belanja</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Pilih Rekening" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {rekeningList.map((rek) => (
                                <SelectItem key={rek.id} value={String(rek.id)}>{rek.namaBank} - {rek.nomorRekening}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        {/* Detail Section */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar Barang</CardTitle>
                <Button type="button" size="sm" onClick={() => append({ idBarang: '', jumlah: 1, hargaSatuan: 0, totalHarga: 0 })}>
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
                                        <ItemCombobox 
                                            options={barangList} 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                            onSelectPrice={(price) => {
                                                // Auto fill price if master has it, optional
                                                form.setValue(`details.${index}.hargaSatuan`, price);
                                            }}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-24">
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
                        <div className="w-40">
                            <FormField
                                control={form.control}
                                name={`details.${index}.hargaSatuan`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Harga Satuan</FormLabel>
                                        <FormControl><Input type="number" min="0" {...field} /></FormControl>
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
                Simpan Transaksi
            </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper Combobox for Barang
function ItemCombobox({ options, value, onChange, onSelectPrice }) {
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
                      if(onSelectPrice) onSelectPrice(item.hargaSatuan);
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === String(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                        <span>{item.namaBarang}</span>
                        <span className="text-xs text-muted-foreground">{item.kodeBarang}</span>
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
