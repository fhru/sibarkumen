import { z } from 'zod';

export const jabatanSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama jabatan wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  unitKerja: z
    .string()
    .max(100, 'Unit kerja maksimal 100 karakter')
    .optional()
    .nullable(),
});
