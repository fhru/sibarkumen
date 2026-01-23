import { z } from 'zod';

export const kodeRekeningSchema = z.object({
  kode: z
    .string()
    .min(1, 'Kode rekening wajib diisi')
    .max(50, 'Kode rekening maksimal 50 karakter'),
  uraian: z
    .string()
    .max(255, 'Uraian maksimal 255 karakter')
    .optional()
    .nullable(),
});
