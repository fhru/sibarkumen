import { z } from 'zod';

export const sppbItemSchema = z.object({
  barangId: z.number().min(1, 'Barang wajib dipilih'),
  qtyDisetujui: z.number().min(1, 'Qty minimal 1'),
  keterangan: z.string().optional(),
});

export const sppbFormSchema = z.object({
  spbId: z.number().min(1, 'SPB wajib dipilih'),
  tanggalSppb: z.date({
    message: 'Tanggal SPPB wajib diisi',
  }),
  pejabatPenyetujuId: z.number().min(1, 'Pejabat penyetuju wajib dipilih'),
  jabatanPejabatPenyetujuId: z.number().optional().nullable(),
  jabatanPembuatId: z.number().optional().nullable(),
  jabatanSerahTerimaOlehId: z.number().optional().nullable(),
  jabatanDiterimaOlehId: z.number().optional().nullable(),
  keterangan: z.string().optional(),
  items: z
    .array(sppbItemSchema)
    .min(1, 'Minimal satu barang harus ditambahkan'),
});

export const completeSPPBSchema = z.object({
  serahTerimaOlehId: z.number(),
  jabatanSerahTerimaOlehId: z.number().optional().nullable(),
});

export type SPPBFormValues = z.infer<typeof sppbFormSchema>;
