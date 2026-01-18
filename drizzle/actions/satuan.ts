'use server';

import { db } from '@/lib/db';
import { satuan } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createSatuanSchema = z.object({
  nama: z.string().min(1, 'Nama satuan wajib diisi'),
});

export async function createSatuan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createSatuanSchema.parse(rawData);

    await db.insert(satuan).values({
      nama: validatedData.nama,
    });

    revalidatePath('/dashboard/satuan');
    return { success: true, message: 'Satuan berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create satuan:', error);

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
        message: 'Nama satuan sudah ada (duplikat)',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan satuan.',
    };
  }
}

const updateSatuanSchema = z.object({
  id: z.coerce.number(),
  nama: z.string().min(1, 'Nama satuan wajib diisi'),
});

export async function updateSatuan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateSatuanSchema.parse(rawData);

    await db
      .update(satuan)
      .set({
        nama: validatedData.nama,
      })
      .where(eq(satuan.id, validatedData.id));

    revalidatePath('/dashboard/satuan');
    return { success: true, message: 'Satuan berhasil diperbarui' };
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
      error.message?.includes('unique constraint')
    ) {
      return {
        success: false,
        message: 'Nama satuan sudah ada (duplikat)',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui satuan: ' + error.message,
    };
  }
}

export async function deleteSatuan(id: number) {
  try {
    await db.delete(satuan).where(eq(satuan.id, id));
    revalidatePath('/dashboard/satuan');
    return { success: true, message: 'Satuan berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus satuan: ' + error.message,
    };
  }
}
