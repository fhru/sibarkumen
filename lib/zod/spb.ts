import { z } from 'zod';

export const spbDetailSchema = z.object({
  barangId: z.number(),
  qtyPermintaan: z.number().min(1),
  keterangan: z.string().optional(),
});

export const createSPBSchema = z.object({
  nomorSpb: z.string().min(1),
  tanggalSpb: z.union([z.string(), z.date()]),
  pemohonId: z.number(),
  keterangan: z.string().optional(),
  items: z.array(spbDetailSchema).min(1),
});
