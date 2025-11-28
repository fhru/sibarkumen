'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { createBastKeluar, getSppbOptions } from '@/app/actions/bast-keluar';
import { getPejabatList } from '@/app/actions/pejabat';

// Schema matches the Server Action
const BastKeluarSchema = z.object({
  nomorBast: z.string().min(1, 'Nomor BAST wajib diisi'),
  tanggalBast: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Tanggal tidak valid',
  }),
  idSppb: z.coerce.number().min(1, 'SPPB wajib dipilih'),
  idPihakMenyerahkan: z.coerce.number().min(1, 'Pihak menyerahkan wajib dipilih'),
  idPihakMenerima: z.coerce.number().min(1, 'Pihak menerima wajib dipilih'), // Readonly/Auto
  keterangan: z.string().optional(),
  details: z.array(
    z.object({
      idBarang: z.number(),
      namaBarang: z.string().optional(), // Display only
      satuan: z.string().optional(), // Display only
      volume: z.coerce.number().min(0), // = jumlah_disalurkan
      jumlahHarga: z.coerce.number().min(0),
      ppn: z.coerce.number().min(0),
      hargaSetelahPpn: z.coerce.number().min(0),
    })
  ).min(1, 'Detail barang kosong'),
});

export function BastKeluarForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sppbList, setSppbList] = useState([]);
  const [pejabatList, setPejabatList] = useState([]);
  const [openSppb, setOpenSppb] = useState(false);

  const form = useForm({
    resolver: zodResolver(BastKeluarSchema),
    defaultValues: {
      nomorBast: '',
      tanggalBast: new Date().toISOString().split('T')[0],
      idSppb: 0,
      idPihakMenyerahkan: 0,
      idPihakMenerima: 0,
      keterangan: '',
      details: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'details',
  });

  // 1. Load Initial Data (Pejabat & SPPB Options)
  useEffect(() => {
    async function loadData() {
      const [sppbRes, pejabatRes] = await Promise.all([
        getSppbOptions(),
        getPejabatList({ limit: 100 }) // Get all officials
      ]);

      setSppbList(sppbRes);
      if (pejabatRes.data) {
          // Filter only valid officials if needed (e.g., Pihak Menyerahkan types)
          setPejabatList(pejabatRes.data);
      }
    }
    loadData();
  }, []);

  // 2. Handle SPPB Selection
  const handleSelectSppb = (sppbId) => {
      const selectedSppb = sppbList.find(s => s.id === sppbId);
      if (!selectedSppb) return;

      form.setValue('idSppb', sppbId);
      form.setValue('idPihakMenerima', selectedSppb.idPenerima);
      
      // Populate Details from SPPB Details
      const newDetails = selectedSppb.details.map(d => {
          const totalHarga = d.jumlahDisalurkan * d.barang.hargaSatuan;
          const ppn = totalHarga * 0.11; // Example PPN 11% logic, can be 0 if not applicable
          
          return {
            idBarang: d.idBarang,
            namaBarang: d.barang.namaBarang,
            satuan: d.barang.satuan,
            volume: d.jumlahDisalurkan,
            jumlahHarga: totalHarga,
            ppn: ppn,
            hargaSetelahPpn: totalHarga + ppn
          };
      });
      
      replace(newDetails);
      setOpenSppb(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await createBastKeluar(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('BAST Keluar berhasil dibuat');
        router.push('/dashboard/bast-keluar');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  // Helper to find Penerima Name
  const selectedPenerimaId = form.watch('idPihakMenerima');
  const penerimaName = sppbList.find(s => s.idPenerima === selectedPenerimaId)?.penerima?.nama || '-';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Header Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Dokumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="nomorBast"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor BAST</FormLabel>
                                <FormControl>
                                    <Input placeholder="BAST-OUT-001" {...field} />
                                </FormControl>
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
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Right Column: Actors */}
            <Card>
                <CardHeader>
                    <CardTitle>Para Pihak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {/* SPPB Selector */}
                     <FormField
                        control={form.control}
                        name="idSppb"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Dasar SPPB</FormLabel>
                            <Popover open={openSppb} onOpenChange={setOpenSppb}>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value
                                        ? sppbList.find(
                                            (s) => s.id === field.value
                                        )?.nomorSppb
                                        : "Pilih SPPB..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Cari nomor SPPB..." />
                                    <CommandList>
                                    <CommandEmpty>SPPB tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {sppbList.map((sppb) => (
                                        <CommandItem
                                            value={sppb.nomorSppb}
                                            key={sppb.id}
                                            onSelect={() => handleSelectSppb(sppb.id)}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                sppb.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {sppb.nomorSppb} ({sppb.penerima.nama})
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

                    {/* Pihak Menerima (ReadOnly) */}
                    <FormItem>
                        <FormLabel>Pihak Menerima</FormLabel>
                        <Input value={penerimaName} disabled readOnly />
                    </FormItem>

                    {/* Pihak Menyerahkan */}
                    <FormField
                        control={form.control}
                        name="idPihakMenyerahkan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pihak Menyerahkan</FormLabel>
                                <Select 
                                    onValueChange={(val) => field.onChange(Number(val))} 
                                    value={field.value ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Pejabat..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {pejabatList.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.pegawai.nama} ({p.jenisJabatan})
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
        </div>

        {/* Bottom: Details Table */}
        <Card>
            <CardHeader>
                <CardTitle>Detail Barang Serah Terima</CardTitle>
            </CardHeader>
            <CardContent>
                 {fields.length === 0 ? (
                     <div className="text-center py-10 text-muted-foreground">
                         Pilih SPPB terlebih dahulu untuk memuat barang.
                     </div>
                 ) : (
                     <div className="relative overflow-x-auto">
                         <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                 <tr>
                                     <th className="px-4 py-2">Barang</th>
                                     <th className="px-4 py-2 w-[100px]">Volume</th>
                                     <th className="px-4 py-2 w-[150px]">Harga Satuan</th>
                                     <th className="px-4 py-2 w-[150px]">Total Harga</th>
                                     <th className="px-4 py-2 w-[150px]">PPN</th>
                                     <th className="px-4 py-2 w-[150px]">Total + PPN</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {fields.map((item, index) => (
                                     <tr key={item.id} className="border-b">
                                         <td className="px-4 py-2 font-medium">
                                             {item.namaBarang}
                                             <div className="text-xs text-muted-foreground">{item.satuan}</div>
                                         </td>
                                         <td className="px-4 py-2">
                                             {/* Volume is editable? Usually it matches SPPB, but maybe partial? 
                                                 PRD implies it's a handover of the SPPB items. 
                                                 Let's make it read-only for now or editable if needed.
                                                 Assuming exact handover.
                                             */}
                                             <Input 
                                                type="number"
                                                {...form.register(`details.${index}.volume`)}
                                                readOnly // Lock to SPPB amount for consistency
                                                className="h-8"
                                             />
                                         </td>
                                         <td className="px-4 py-2">
                                             {/* Calculated: JumlahHarga / Volume? Or we don't store HargaSatuan in this table explicitly */}
                                             {new Intl.NumberFormat('id-ID').format(item.jumlahHarga / item.volume)}
                                         </td>
                                         <td className="px-4 py-2">
                                             <Input 
                                                type="number"
                                                {...form.register(`details.${index}.jumlahHarga`)}
                                                className="h-8"
                                             />
                                         </td>
                                         <td className="px-4 py-2">
                                             <Input 
                                                type="number"
                                                {...form.register(`details.${index}.ppn`)}
                                                className="h-8"
                                             />
                                         </td>
                                         <td className="px-4 py-2">
                                             <Input 
                                                type="number"
                                                {...form.register(`details.${index}.hargaSetelahPpn`)}
                                                className="h-8"
                                             />
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan BAST Keluar
            </Button>
        </div>
      </form>
    </Form>
  );
}
