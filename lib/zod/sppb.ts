import { z } from 'zod';

export const sppbDetailSchema = z.object({
  barangId: z.number(),
  qtyDisetujui: z.number().min(1),
  keterangan: z.string().optional(),
});

export const createSPPBSchema = z.object({
  spbId: z.number(),
  tanggalSppb: z.union([z.string(), z.date()]),
  pejabatPenyetujuId: z.number(),
  // diterimaOlehId removed from input validation, will be auto-populated
  keterangan: z.string().optional(),
  items: z.array(sppbDetailSchema).min(1),
});

export const completeSPPBSchema = z.object({
  serahTerimaOlehId: z.number(),
});
