'use server';

import { db } from '@/lib/db';
import { kategori } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createKategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori wajib diisi'),
});

export async function createKategori(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createKategoriSchema.parse(rawData);

    await db.insert(kategori).values({
      nama: validatedData.nama,
    });

    revalidatePath('/dashboard/kategori');
    return { success: true, message: 'Kategori berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create kategori:', error);

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
        message: 'Nama kategori sudah ada (duplikat)',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan kategori.',
    };
  }
}

const updateKategoriSchema = z.object({
  id: z.coerce.number(),
  nama: z.string().min(1, 'Nama kategori wajib diisi'),
});

export async function updateKategori(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateKategoriSchema.parse(rawData);

    await db
      .update(kategori)
      .set({
        nama: validatedData.nama,
      })
      .where(eq(kategori.id, validatedData.id));

    revalidatePath('/dashboard/kategori');
    return { success: true, message: 'Kategori berhasil diperbarui' };
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
        message: 'Nama kategori sudah ada (duplikat)',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui kategori: ' + error.message,
    };
  }
}

export async function deleteKategori(id: number) {
  try {
    await db.delete(kategori).where(eq(kategori.id, id));
    revalidatePath('/dashboard/kategori');
    return { success: true, message: 'Kategori berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus kategori: ' + error.message,
    };
  }
}
