'use server';

import { db } from '@/lib/db';
import { pegawai } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createPegawaiSchema = z.object({
  nama: z.string().min(1, 'Nama pegawai wajib diisi'),
  nip: z
    .string()
    .regex(/^[0-9]*$/, 'NIP harus berupa angka dan tidak boleh desimal')
    .optional(),
});

export async function createPegawai(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createPegawaiSchema.parse(rawData);

    await db.insert(pegawai).values({
      nama: validatedData.nama,
      nip: validatedData.nip || null,
    });

    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Pegawai berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create pegawai:', error);

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
      // Check for NIP uniqueness
      if (error.message?.includes('pegawai_nip_key')) {
        return {
          success: false,
          message: 'NIP sudah terdaftar.',
        };
      }
      return {
        success: false,
        message: 'Data pegawai duplikat.',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan pegawai.',
    };
  }
}

const updatePegawaiSchema = z.object({
  id: z.coerce.number(),
  nama: z.string().min(1, 'Nama pegawai wajib diisi'),
  nip: z
    .string()
    .regex(/^[0-9]*$/, 'NIP harus berupa angka dan tidak boleh desimal')
    .optional(),
});

export async function updatePegawai(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updatePegawaiSchema.parse(rawData);

    await db
      .update(pegawai)
      .set({
        nama: validatedData.nama,
        nip: validatedData.nip || null,
      })
      .where(eq(pegawai.id, validatedData.id));

    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Pegawai berhasil diperbarui' };
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
      if (error.message?.includes('pegawai_nip_key')) {
        return {
          success: false,
          message: 'NIP sudah terdaftar.',
        };
      }
      return {
        success: false,
        message: 'Data pegawai duplikat.',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui pegawai: ' + error.message,
    };
  }
}

export async function deletePegawai(id: number) {
  try {
    await db.delete(pegawai).where(eq(pegawai.id, id));
    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Pegawai berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus pegawai: ' + error.message,
    };
  }
}
