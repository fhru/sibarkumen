'use server';

import { db } from '@/lib/db';
import { asalPembelian } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createAsalPembelianSchema = z.object({
  nama: z.string().min(1, 'Nama asal pembelian wajib diisi'),
});

export async function createAsalPembelian(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createAsalPembelianSchema.parse(rawData);

    await db.insert(asalPembelian).values({
      nama: validatedData.nama,
    });

    revalidatePath('/dashboard/asal-pembelian');
    return { success: true, message: 'Asal Pembelian berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create asal pembelian:', error);

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
        message: 'Nama asal pembelian sudah ada (duplikat)',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan asal pembelian.',
    };
  }
}

const updateAsalPembelianSchema = z.object({
  id: z.coerce.number(),
  nama: z.string().min(1, 'Nama asal pembelian wajib diisi'),
});

export async function updateAsalPembelian(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateAsalPembelianSchema.parse(rawData);

    await db
      .update(asalPembelian)
      .set({
        nama: validatedData.nama,
      })
      .where(eq(asalPembelian.id, validatedData.id));

    revalidatePath('/dashboard/asal-pembelian');
    return { success: true, message: 'Asal Pembelian berhasil diperbarui' };
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
        message: 'Nama asal pembelian sudah ada (duplikat)',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui asal pembelian: ' + error.message,
    };
  }
}

export async function deleteAsalPembelian(id: number) {
  try {
    await db.delete(asalPembelian).where(eq(asalPembelian.id, id));
    revalidatePath('/dashboard/asal-pembelian');
    return { success: true, message: 'Asal Pembelian berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus asal pembelian: ' + error.message,
    };
  }
}
