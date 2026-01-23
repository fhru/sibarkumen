import { z } from 'zod';

export const rekeningSchema = z.object({
  namaBank: z
    .string()
    .min(1, 'Nama bank wajib diisi')
    .max(50, 'Nama maksimal 50 karakter'),
  nomorRekening: z
    .string()
    .min(1, 'Nomor rekening wajib diisi')
    .regex(/^[0-9]+$/, 'Nomor rekening harus berupa angka')
    .max(50, 'Nomor rekening maksimal 50 karakter'),
  namaPemilik: z
    .string()
    .min(1, 'Nama pemilik wajib diisi')
    .max(100, 'Nama pemilik maksimal 100 karakter'),
  keterangan: z
    .string()
    .max(255, 'Keterangan maksimal 255 karakter')
    .optional()
    .nullable(),
});
