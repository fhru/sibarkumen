'use server';

import { db } from '@/lib/db';
import { pegawai } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { pegawaiSchema } from '@/lib/zod/pegawai';

const createPegawaiSchema = pegawaiSchema;

export async function createPegawai(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createPegawaiSchema.parse(rawData);

    await db.insert(pegawai).values({
      nama: validatedData.nama,
      nip: validatedData.nip || null,
      userId: validatedData.userId || null,
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
      // Check for User ID uniqueness
      if (error.message?.includes('pegawai_user_id_unique')) {
        return {
          success: false,
          message: 'User ini sudah terhubung dengan pegawai lain.',
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

export async function getAvailableUsers(currentUserId?: string | null) {
  // Fetch all users who are NOT yet linked to any pegawai
  // EXCEPT the currentUserId (if provided, meaning we are editing and keep the same user)

  // This is a bit complex with pure Drizzle without raw SQL for NOT EXISTS,
  // but we can fetch all users and all taken userIds, then filter.
  // Or use left join.

  // Simple approach: Get all users, Get all assigned userIds.
  const allUsers = await db.query.user.findMany({
    columns: { id: true, name: true, email: true, role: true },
  });

  const assignedPegapwais = await db.query.pegawai.findMany({
    columns: { userId: true },
  });

  const assignedUserIds = new Set(
    assignedPegapwais.map((p) => p.userId).filter(Boolean)
  );

  return allUsers.filter((u) => {
    if (currentUserId && u.id === currentUserId) return true; // Allow current user
    return !assignedUserIds.has(u.id);
  });
}

const updatePegawaiSchema = pegawaiSchema.extend({
  id: z.coerce.number(),
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
        userId: validatedData.userId || null,
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
