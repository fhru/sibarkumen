import { z } from 'zod';

export const stockOpnameItemSchema = z.object({
  stokFisik: z
    .number()
    .min(0, 'Stok fisik tidak boleh negatif')
    .max(999999999, 'Stok fisik maksimal 999999999'),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional(),
});
