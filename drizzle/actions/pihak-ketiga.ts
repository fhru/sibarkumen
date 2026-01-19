'use server';

import { db } from '@/lib/db';
import { pihakKetiga } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createPihakKetigaSchema = z.object({
  nama: z.string().min(1, 'Nama pihak ketiga wajib diisi'),
});

export async function createPihakKetiga(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createPihakKetigaSchema.parse(rawData);

    await db.insert(pihakKetiga).values({
      nama: validatedData.nama,
    });

    revalidatePath('/dashboard/pihak-ketiga');
    return { success: true, message: 'Pihak Ketiga berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create pihak ketiga:', error);

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
        message: 'Nama pihak ketiga sudah ada (duplikat)',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan pihak ketiga.',
    };
  }
}

const updatePihakKetigaSchema = z.object({
  id: z.coerce.number(),
  nama: z.string().min(1, 'Nama pihak ketiga wajib diisi'),
});

export async function updatePihakKetiga(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updatePihakKetigaSchema.parse(rawData);

    await db
      .update(pihakKetiga)
      .set({
        nama: validatedData.nama,
      })
      .where(eq(pihakKetiga.id, validatedData.id));

    revalidatePath('/dashboard/pihak-ketiga');
    return { success: true, message: 'Pihak Ketiga berhasil diperbarui' };
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
        message: 'Nama pihak ketiga sudah ada (duplikat)',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui pihak ketiga: ' + error.message,
    };
  }
}

export async function deletePihakKetiga(id: number) {
  try {
    await db.delete(pihakKetiga).where(eq(pihakKetiga.id, id));
    revalidatePath('/dashboard/pihak-ketiga');
    return { success: true, message: 'Pihak Ketiga berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus pihak ketiga: ' + error.message,
    };
  }
}
