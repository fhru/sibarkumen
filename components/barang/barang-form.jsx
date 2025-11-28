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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createBarang, updateBarang } from '@/app/actions/barang';
import { getKategoriOptions } from '@/app/actions/kategori';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  kodeBarang: z.string().optional(), // Auto-generated now
  namaBarang: z.string().min(1, 'Nama barang harus diisi'),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  satuan: z.string().min(1, 'Satuan harus diisi'),
  spesifikasi: z.string().optional(),
  asalPembelian: z.string().min(1, 'Asal pembelian harus diisi'),
  stokMinimum: z.coerce.number().min(0, 'Stok minimum tidak boleh negatif'),
  hargaSatuan: z.coerce.number().min(0, 'Harga satuan tidak boleh negatif'),
});

export function BarangForm({ initialData, onSuccess }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      const list = await getKategoriOptions();
      setCategories(list);
    };
    loadCategories();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      kodeBarang: '',
      namaBarang: '',
      kategori: '',
      satuan: '',
      spesifikasi: '',
      asalPembelian: '',
      stokMinimum: 0,
      hargaSatuan: 0,
    },
  });

  async function onSubmit(values) {
    setIsPending(true);
    setError('');

    try {
      let result;
      if (initialData) {
        result = await updateBarang(initialData.id, values);
      } else {
        result = await createBarang(values);
      }

      if (result.error) {
        setError(result.error);
      } else {
        // Important: Do not reset() on edit success if you want to keep the form open
        // But since we close it, it's fine. 
        // For Create, we definitely want to reset.
        if (!initialData) {
            form.reset();
        }
        router.refresh();
        if (onSuccess) onSuccess(); // This triggers the dialog close
      }
    } catch (e) {
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kode Barang is hidden or read-only for new items */}
          {initialData && (
            <FormField
              control={form.control}
              name="kodeBarang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Barang</FormLabel>
                  <FormControl>
                    <Input {...field} disabled readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="namaBarang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Barang</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Laptop ASUS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kategori"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!initialData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.kode}>
                        {cat.nama} ({cat.kode})
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
            name="satuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan</FormLabel>
                <FormControl>
                  <Input placeholder="Unit / Rim / Pcs" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="APBD 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stokMinimum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Minimum</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hargaSatuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Satuan (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="spesifikasi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spesifikasi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi detail barang..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Simpan Perubahan' : 'Tambah Barang'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
