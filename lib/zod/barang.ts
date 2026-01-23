import { z } from 'zod';

export const createBarangSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  kategoriId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  satuanId: z.coerce.number().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z
    .string()
    .max(500, 'Spesifikasi maksimal 500 karakter')
    .optional(),
});

export const updateBarangSchema = z.object({
  id: z.coerce.number(),
  nama: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  stok: z.coerce
    .number()
    .min(0, 'Stok tidak boleh kurang dari 0')
    .max(1000000, 'Stok maksimal 1.000.000'),
  kategoriId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  satuanId: z.coerce.number().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z
    .string()
    .max(500, 'Spesifikasi maksimal 500 karakter')
    .optional(),
});
