import { z } from 'zod';

export const pihakKetigaSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama pihak ketiga wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
});
