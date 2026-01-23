import { z } from 'zod';

export const bastMasukDetailSchema = z.object({
  barangId: z.number(),
  qty: z.number().min(1).max(999999999, 'Qty maksimal 999999999'),
  hargaSatuan: z
    .number()
    .min(0)
    .max(999999999, 'Harga satuan maksimal 999999999'),
  keterangan: z.string().optional(),
});

export const createBastMasukSchema = z.object({
  nomorReferensi: z.string().optional(),
  nomorBast: z.string().min(1).max(100, 'Nomor BAST maksimal 100 karakter'),
  tanggalBast: z.union([z.string(), z.date()]),
  nomorBapb: z.string().min(1).max(100, 'Nomor BAPB maksimal 100 karakter'),
  tanggalBapb: z.union([z.string(), z.date()]),
  asalPembelianId: z.number(),
  rekeningId: z.number(),
  pihakKetigaId: z.number(),
  pptkPpkId: z.number(),
  peruntukkan: z.string().optional(),
  keterangan: z.string().optional(),
  items: z.array(bastMasukDetailSchema).min(1),
});
