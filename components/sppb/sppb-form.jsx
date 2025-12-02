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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createSppb } from '@/app/actions/sppb';
import { getBarangStock } from '@/app/actions/barang';

const formSchema = z.object({
  nomorSppb: z.string().optional(),
  tanggalSppb: z.string().min(1, 'Tanggal wajib diisi'),
  idSpb: z.string().min(1, 'SPB wajib dipilih'),
  idPejabatPenatausahaan: z.string().min(1, 'Wajib dipilih'),
  idPengelolaBarang: z.string().min(1, 'Wajib dipilih'),
  idPenerima: z.string().min(1, 'Penerima wajib dipilih'),
  keterangan: z.string().optional(),
  details: z.array(z.object({
      idBarang: z.number(),
      namaBarang: z.string(),
      satuan: z.string().optional(),
      jumlahDisalurkan: z.coerce.number().min(1),
      maxJumlah: z.number(), // For validation display (requested amount)
      realStock: z.number().optional(), // Actual warehouse stock
  })).min(1).refine((data) => {
      // Validate if any item exceeds stock
      return data.every(item => !item.realStock || item.jumlahDisalurkan <= item.realStock);
  }, {
      message: "Jumlah disalurkan melebihi stok tersedia",
      path: ["details"] // This might need adjustment to target specific row
  }),
});

export function SppbForm({ 
  pegawaiOptions = [], 
  pejabatOptions = [], 
  spbOptions: initialSpbOptions = [] 
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const spbIdParam = searchParams.get('spbId');

  // Data is now passed from server component
  const spbOptions = initialSpbOptions;
  const pejabatList = pejabatOptions;
  const pegawaiList = pegawaiOptions;

  // Effect to auto-select SPB if param exists and options are loaded
  useEffect(() => {
      if (spbIdParam && spbOptions.length > 0) {
          onSpbChange(spbIdParam);
      }
  }, [spbIdParam, spbOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomorSppb: '',
      tanggalSppb: new Date().toISOString().split('T')[0],
      idSpb: '',
      idPejabatPenatausahaan: '',
      idPengelolaBarang: '',
      idPenerima: '',
      keterangan: '',
      details: []
    },
  });

  const { fields, replace, update } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // Handle SPB Selection Change -> Auto fill details & penerima
  const onSpbChange = async (spbId) => {
      form.setValue('idSpb', spbId);
      const selectedSpb = spbOptions.find(s => String(s.id) === spbId);
      if (selectedSpb) {
          // Auto fill penerima if pemohon exists
          if (selectedSpb.pemohonId) {
              form.setValue('idPenerima', String(selectedSpb.pemohonId));
          }
          
          // Fetch current real stock for each item
          const itemsWithStock = await Promise.all(selectedSpb.details.map(async (d) => {
              const stock = await getBarangStock(d.idBarang);
              return {
                  idBarang: d.idBarang,
                  namaBarang: d.barang?.namaBarang || 'Unknown',
                  satuan: d.barang?.satuan || 'Unit',
                  jumlahDisalurkan: d.jumlah, // Default to requested amount
                  maxJumlah: d.jumlah, // Requested amount
                  realStock: stock
              };
          }));
          
          replace(itemsWithStock);
      }
  };

  async function onSubmit(values) {
    // Double check client side logic for stock
    const invalidStock = values.details.find(d => d.realStock !== undefined && d.jumlahDisalurkan > d.realStock);
    if (invalidStock) {
        toast.error(`Stok tidak cukup untuk ${invalidStock.namaBarang}. Tersedia: ${invalidStock.realStock}`);
        return;
    }

    setIsPending(true);
    
    const payload = {
        ...values,
        idSpb: parseInt(values.idSpb),
        idPejabatPenatausahaan: parseInt(values.idPejabatPenatausahaan),
        idPengelolaBarang: parseInt(values.idPengelolaBarang),
        idPenerima: parseInt(values.idPenerima),
        details: values.details.map(d => ({
            idBarang: d.idBarang,
            jumlahDisalurkan: d.jumlahDisalurkan
        }))
    };

    const result = await createSppb(payload);

    if (result.error) {
        toast.error(result.error);
    } else {
        toast.success('SPPB Berhasil Dibuat');
        router.push('/dashboard/sppb');
        router.refresh();
    }
    setIsPending(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <Card>
            <CardHeader><CardTitle>Informasi Penyaluran</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="nomorSppb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nomor SPPB</FormLabel>
                        <FormControl><Input placeholder="Otomatis di-generate sistem" readOnly {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tanggalSppb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanggal SPPB</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="idSpb"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dasar SPB</FormLabel>
                        <Select onValueChange={onSpbChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Pilih SPB..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {spbOptions.map((spb) => (
                                <SelectItem key={spb.id} value={String(spb.id)}>
                                    {spb.nomorSpb} - {spb.pemohon?.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="idPenerima"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Penerima Barang</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Pilih Penerima..." /></SelectTrigger>
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
                    name="idPejabatPenatausahaan"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pejabat Penatausahaan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Pilih Pejabat..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {pejabatList.map((pj) => (
                                <SelectItem key={pj.id} value={String(pj.id)}>
                                    {pj.pegawai?.nama} - {pj.jenisJabatan}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="idPengelolaBarang"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pengelola Barang</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Pilih Pengelola..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {pejabatList.map((pj) => (
                                <SelectItem key={pj.id} value={String(pj.id)}>
                                    {pj.pegawai?.nama} - {pj.jenisJabatan}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Barang Disalurkan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {fields.length === 0 && <p className="text-muted-foreground text-sm">Silahkan pilih SPB terlebih dahulu.</p>}
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                        <div className="flex-1">
                            <div className="text-sm font-medium">{item.namaBarang}</div>
                            <div className="text-xs text-muted-foreground">
                                Permintaan: {item.maxJumlah} {item.satuan}
                            </div>
                            <div className={`text-xs font-semibold ${item.realStock < item.jumlahDisalurkan ? 'text-red-600' : 'text-green-600'}`}>
                                Stok Gudang: {item.realStock} {item.satuan}
                            </div>
                        </div>
                        <div className="w-32">
                            <FormField
                                control={form.control}
                                name={`details.${index}.jumlahDisalurkan`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Disalurkan</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                {...field}
                                                className={item.realStock < field.value ? "border-red-500 focus-visible:ring-red-500" : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan SPPB
            </Button>
        </div>
      </form>
    </Form>
  );
}
