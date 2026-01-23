import { z } from 'zod';

export const bastKeluarItemSchema = z.object({
  barangId: z.number().min(1, 'Barang wajib dipilih'),
  qtySerahTerima: z.number().min(1, 'Qty minimal 1'),
  hargaSatuan: z.number().min(0, 'Harga satuan minimal 0'),
  persentasePpn: z.number().min(0, 'Min 0%').max(100, 'Max 100%'),
  keterangan: z.string().optional(),
});

export const bastKeluarFormSchema = z.object({
  sppbId: z.number().min(1, 'SPPB wajib dipilih'),
  tanggalBast: z.date({
    message: 'Tanggal BAST wajib diisi',
  }),
  pihakPertamaId: z.number().min(1, 'Pihak Pertama wajib dipilih'),
  jabatanPihakPertamaId: z.number().optional().nullable(),
  pihakKeduaId: z.number().min(1, 'Pihak Kedua wajib dipilih'),
  jabatanPihakKeduaId: z.number().optional().nullable(),
  keterangan: z.string().optional(),
  items: z
    .array(bastKeluarItemSchema)
    .min(1, 'Minimal satu barang harus ditambahkan'),
});

export type BastKeluarFormValues = z.infer<typeof bastKeluarFormSchema>;
