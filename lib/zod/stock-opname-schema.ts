import * as z from 'zod';

export const stockOpnameItemSchema = z.object({
  stokFisik: z
    .number()
    .min(0, 'Stok fisik tidak boleh negatif')
    .max(999999999, 'Stok fisik maksimal 999999999'),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional(),
});

export const createStockOpnameSchema = z.object({
  petugasId: z.number().min(1, 'Petugas wajib dipilih'),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional(),
});

export type StockOpnameItemFormValues = z.infer<typeof stockOpnameItemSchema>;
export type CreateStockOpnameFormValues = z.infer<
  typeof createStockOpnameSchema
>;
