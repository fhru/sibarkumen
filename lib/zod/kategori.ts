import z from 'zod';

export const kategoriSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama kategori wajib diisi')
    .max(50, 'Nama maksimal 50 karakter'),
  prefix: z
    .string()
    .min(1, 'Prefix wajib diisi')
    .max(3, 'Prefix maksimal 3 karakter'),
});
