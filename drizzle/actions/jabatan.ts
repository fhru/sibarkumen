'use server';

import { db } from '@/lib/db';
import { jabatan } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { jabatanSchema } from '@/lib/zod/jabatan';

const createJabatanSchema = jabatanSchema;

export async function createJabatan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createJabatanSchema.parse(rawData);

    await db.insert(jabatan).values({
      nama: validatedData.nama,
      unitKerja: validatedData.unitKerja,
    });

    revalidatePath('/dashboard/jabatan');
    return { success: true, message: 'Jabatan berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create jabatan:', error);

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
      if (error.message?.includes('jabatan_nama_key')) {
        return {
          success: false,
          message: 'Nama jabatan sudah ada (duplikat)',
        };
      }
      return {
        success: false,
        message: 'Nama jabatan sudah ada (duplikat)',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan jabatan.',
    };
  }
}

const updateJabatanSchema = jabatanSchema.extend({
  id: z.coerce.number(),
});

export async function updateJabatan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateJabatanSchema.parse(rawData);

    await db
      .update(jabatan)
      .set({
        nama: validatedData.nama,
        unitKerja: validatedData.unitKerja,
      })
      .where(eq(jabatan.id, validatedData.id));

    revalidatePath('/dashboard/jabatan');
    return { success: true, message: 'Jabatan berhasil diperbarui' };
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
        message: 'Nama jabatan sudah ada (duplikat)',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui jabatan: ' + error.message,
    };
  }
}

export async function deleteJabatan(id: number) {
  try {
    await db.delete(jabatan).where(eq(jabatan.id, id));
    revalidatePath('/dashboard/jabatan');
    return { success: true, message: 'Jabatan berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus jabatan: ' + error.message,
    };
  }
}
