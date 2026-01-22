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
  keterangan: z.string().optional(),
  items: z
    .array(sppbItemSchema)
    .min(1, 'Minimal satu barang harus ditambahkan'),
});

export type SPPBFormValues = z.infer<typeof sppbFormSchema>;
