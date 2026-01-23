import { z } from 'zod';

export const pegawaiSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama pegawai wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  nip: z
    .string()
    .regex(/^[0-9]*$/, 'NIP harus berupa angka')
    .max(50, 'NIP maksimal 50 karakter')
    .optional()
    .nullable(),
  userId: z.string().optional().nullable(),
});
