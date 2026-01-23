import { z } from 'zod';

export const asalPembelianSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama asal pembelian wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
});
