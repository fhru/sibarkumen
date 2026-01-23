'use server';

import { db } from '@/lib/db';
import { kodeRekening } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { kodeRekeningSchema } from '@/lib/zod/kode-rekening-schema';

const createKodeRekeningSchema = kodeRekeningSchema;

export async function createKodeRekening(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createKodeRekeningSchema.parse(rawData);

    await db.insert(kodeRekening).values({
      kode: validatedData.kode,
      uraian: validatedData.uraian || null,
    });

    revalidatePath('/dashboard/kode-rekening');
    return { success: true, message: 'Kode Rekening berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create kode rekening:', error);

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
      error.message?.includes('unique constraint')
    ) {
      return {
        success: false,
        message: 'Kode rekening sudah terdaftar.',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan kode rekening.',
    };
  }
}

const updateKodeRekeningSchema = kodeRekeningSchema.extend({
  id: z.coerce.number(),
});

export async function updateKodeRekening(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateKodeRekeningSchema.parse(rawData);

    await db
      .update(kodeRekening)
      .set({
        kode: validatedData.kode,
        uraian: validatedData.uraian || null,
      })
      .where(eq(kodeRekening.id, validatedData.id));

    revalidatePath('/dashboard/kode-rekening');
    return { success: true, message: 'Kode Rekening berhasil diperbarui' };
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
        message: 'Kode rekening sudah terdaftar.',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui kode rekening: ' + error.message,
    };
  }
}

export async function deleteKodeRekening(id: number) {
  try {
    await db.delete(kodeRekening).where(eq(kodeRekening.id, id));
    revalidatePath('/dashboard/kode-rekening');
    return { success: true, message: 'Kode Rekening berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus kode rekening: ' + error.message,
    };
  }
}
