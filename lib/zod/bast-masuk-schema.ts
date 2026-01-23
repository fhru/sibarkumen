import * as z from 'zod';

export const bastMasukDetailSchema = z.object({
  barangId: z.number().min(1, 'Barang wajib dipilih'),
  qty: z
    .number('Qty Wajib diisi')
    .min(1, 'Qty minimal 1')
    .max(999999999, 'Qty maksimal 999999999'),
  hargaSatuan: z
    .number('Harga tidak boleh negatif')
    .min(0, 'Harga tidak boleh negatif')
    .max(999999999, 'Harga satuan maksimal 999999999'),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional(),
  satuanNama: z.string().optional(),
});

export const createBastMasukSchema = z.object({
  nomorReferensi: z.string().optional(), // Auto-generated
  nomorBast: z.string().min(1, 'Nomor BAST wajib diisi'),
  tanggalBast: z.date({
    message: 'Tanggal BAST wajib diisi',
  }),
  nomorBapb: z.string().min(1, 'Nomor BAPB wajib diisi'),
  tanggalBapb: z.date({
    message: 'Tanggal BAPB wajib diisi',
  }),
  asalPembelianId: z
    .number('Asal pembelian wajib dipilih')
    .min(1, 'Asal pembelian wajib dipilih'),
  rekeningId: z
    .number('Rekening wajib dipilih')
    .min(1, 'Rekening wajib dipilih'),
  pihakKetigaId: z
    .number('Pihak ketiga wajib dipilih')
    .min(1, 'Pihak ketiga wajib dipilih'),
  pptkPpkId: z
    .number('PPTK/PPK wajib dipilih')
    .min(1, 'PPTK/PPK wajib dipilih'),
  peruntukkan: z.string().optional(),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional(),
  items: z
    .array(bastMasukDetailSchema)
    .min(1, 'Minimal satu barang harus ditambahkan'),
});

export type BastMasukFormValues = z.infer<typeof createBastMasukSchema>;

export type Option = { id: number; nama: string };
export type RekeningOption = Option & {
  kode: string;
  uraian?: string | null;
};
