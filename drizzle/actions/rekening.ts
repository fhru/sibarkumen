'use server';

import { db } from '@/lib/db';
import { rekening } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createRekeningSchema = z.object({
  namaBank: z.string().min(1, 'Nama bank wajib diisi'),
  nomorRekening: z
    .string()
    .min(1, 'Nomor rekening wajib diisi')
    .regex(
      /^[0-9]+$/,
      'Nomor rekening harus berupa angka dan tidak boleh desimal'
    ),
  namaPemilik: z.string().min(1, 'Nama pemilik wajib diisi'),
  keterangan: z.string().optional(),
});

export async function createRekening(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createRekeningSchema.parse(rawData);

    await db.insert(rekening).values({
      namaBank: validatedData.namaBank,
      nomorRekening: validatedData.nomorRekening,
      namaPemilik: validatedData.namaPemilik,
      keterangan: validatedData.keterangan || null,
    });

    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create rekening:', error);

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
      if (error.message?.includes('rekening_nomor_rekening_key')) {
        return {
          success: false,
          message: 'Nomor rekening sudah terdaftar.',
        };
      }

      return {
        success: false,
        message: 'Nomor rekening sudah terdaftar.',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan rekening.',
    };
  }
}

const updateRekeningSchema = z.object({
  id: z.coerce.number(),
  namaBank: z.string().min(1, 'Nama bank wajib diisi'),
  nomorRekening: z
    .string()
    .min(1, 'Nomor rekening wajib diisi')
    .regex(
      /^[0-9]+$/,
      'Nomor rekening harus berupa angka dan tidak boleh desimal'
    ),
  namaPemilik: z.string().min(1, 'Nama pemilik wajib diisi'),
  keterangan: z.string().optional(),
});

export async function updateRekening(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateRekeningSchema.parse(rawData);

    await db
      .update(rekening)
      .set({
        namaBank: validatedData.namaBank,
        nomorRekening: validatedData.nomorRekening,
        namaPemilik: validatedData.namaPemilik,
        keterangan: validatedData.keterangan || null,
      })
      .where(eq(rekening.id, validatedData.id));

    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil diperbarui' };
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
      if (error.message?.includes('rekening_nama_bank_key')) {
        return {
          success: false,
          message: 'Nama bank sudah ada.',
        };
      }
      if (error.message?.includes('rekening_nomor_rekening_key')) {
        return {
          success: false,
          message: 'Nomor rekening sudah terdaftar.',
        };
      }
      return {
        success: false,
        message: 'Data duplikat (Nama Bank atau Nomor Rekening sudah ada).',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui rekening: ' + error.message,
    };
  }
}

export async function deleteRekening(id: number) {
  try {
    await db.delete(rekening).where(eq(rekening.id, id));
    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus rekening: ' + error.message,
    };
  }
}
