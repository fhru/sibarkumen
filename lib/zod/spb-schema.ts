import * as z from 'zod';

export const spbItemDetailSchema = z.object({
  barangId: z.number().min(1, 'Barang wajib dipilih'),
  qtyPermintaan: z.number().min(1, 'Qty minimal 1'),
  keterangan: z.string().optional(),
  stok: z.number().optional(),
  nama: z.string().optional(),
});

export const createSpbSchema = z.object({
  nomorSpb: z.string().min(1, 'Nomor SPB wajib diisi'),
  tanggalSpb: z.date({
    message: 'Tanggal SPB wajib diisi',
  }),
  pemohonId: z.number('Pemohon wajib dipilih').min(1, 'Pemohon wajib dipilih'),
  jabatanId: z.number().optional().nullable(),
  keterangan: z.string().optional(),
  items: z
    .array(spbItemDetailSchema)
    .min(1, 'Minimal satu barang harus ditambahkan'),
});

export type SPBFormValues = z.infer<typeof createSpbSchema>;

export type Option = { id: number; nama: string };
