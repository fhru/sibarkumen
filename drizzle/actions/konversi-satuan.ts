'use server';

import { db } from '@/lib/db';
import { konversiSatuan } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createKonversiSatuanSchema = z.object({
  barangId: z.coerce.number().min(1, 'Barang harus dipilih'),
  satuanBesarId: z.coerce.number().min(1, 'Satuan Besar harus dipilih'),
  satuanKecilId: z.coerce.number().min(1, 'Satuan Kecil harus dipilih'),
  nilaiKonversi: z.coerce.number().min(1, 'Nilai konversi minimal 1'),
});

export async function createKonversiSatuan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createKonversiSatuanSchema.parse(rawData);

    // Validasi tambahan: Satuan Besar dan Kecil tidak boleh sama
    if (validatedData.satuanBesarId === validatedData.satuanKecilId) {
      return {
        success: false,
        message: 'Satuan Besar dan Satuan Kecil tidak boleh sama',
      };
    }

    await db.insert(konversiSatuan).values({
      barangId: validatedData.barangId,
      satuanBesarId: validatedData.satuanBesarId,
      satuanKecilId: validatedData.satuanKecilId,
      nilaiKonversi: validatedData.nilaiKonversi,
    });

    revalidatePath('/dashboard/konversi-satuan');
    return { success: true, message: 'Konversi satuan berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create konversi satuan:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validasi gagal',
        errors: error.flatten().fieldErrors,
      };
    }

    if (
      error.code === '23505' ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('unique constraint') ||
      error.message?.includes('Failed query')
    ) {
      return {
        success: false,
        message: 'Konversi untuk kombinasi barang dan satuan ini sudah ada',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan konversi satuan.',
    };
  }
}

const updateKonversiSatuanSchema = z.object({
  id: z.coerce.number(),
  barangId: z.coerce.number().min(1, 'Barang harus dipilih'),
  satuanBesarId: z.coerce.number().min(1, 'Satuan Besar harus dipilih'),
  satuanKecilId: z.coerce.number().min(1, 'Satuan Kecil harus dipilih'),
  nilaiKonversi: z.coerce.number().min(1, 'Nilai konversi minimal 1'),
});

export async function updateKonversiSatuan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateKonversiSatuanSchema.parse(rawData);

    if (validatedData.satuanBesarId === validatedData.satuanKecilId) {
      return {
        success: false,
        message: 'Satuan Besar dan Satuan Kecil tidak boleh sama',
      };
    }

    await db
      .update(konversiSatuan)
      .set({
        barangId: validatedData.barangId,
        satuanBesarId: validatedData.satuanBesarId,
        satuanKecilId: validatedData.satuanKecilId,
        nilaiKonversi: validatedData.nilaiKonversi,
      })
      .where(eq(konversiSatuan.id, validatedData.id));

    revalidatePath('/dashboard/konversi-satuan');
    return { success: true, message: 'Konversi satuan berhasil diperbarui' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Gagal validasi data',
        errors: error.flatten().fieldErrors,
      };
    }
    if (
      error.code === '23505' ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('unique constraint') ||
      error.message?.includes('Failed query')
    ) {
      return {
        success: false,
        message: 'Konversi untuk kombinasi barang dan satuan ini sudah ada',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui konversi satuan: ' + error.message,
    };
  }
}

export async function deleteKonversiSatuan(id: number) {
  try {
    await db.delete(konversiSatuan).where(eq(konversiSatuan.id, id));
    revalidatePath('/dashboard/konversi-satuan');
    return { success: true, message: 'Konversi satuan berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus konversi satuan: ' + error.message,
    };
  }
}
