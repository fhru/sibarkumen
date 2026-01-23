import { z } from 'zod';

export const satuanSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama satuan wajib diisi')
    .max(50, 'Nama maksimal 50 karakter'),
});
