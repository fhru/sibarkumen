'use server';

import { db } from '@/lib/db';
import { pegawaiJabatan } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

const createPegawaiJabatanSchema = z.object({
  pegawaiId: z.coerce.number(),
  jabatanId: z.coerce.number(),
  isAktif: z.boolean().default(true),
});

export async function createPegawaiJabatan(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    // Handle checkbox/boolean manually if coming from FormData
    const payload = {
      ...rawData,
      isAktif: rawData.isAktif === 'on' || rawData.isAktif === 'true',
    };

    const validatedData = createPegawaiJabatanSchema.parse(payload);

    // Check for duplicate
    const existing = await db.query.pegawaiJabatan.findFirst({
      where: and(
        eq(pegawaiJabatan.pegawaiId, validatedData.pegawaiId),
        eq(pegawaiJabatan.jabatanId, validatedData.jabatanId)
      ),
    });

    if (existing) {
      return {
        success: false,
        message: 'Pegawai sudah memiliki jabatan ini.',
      };
    }

    await db.insert(pegawaiJabatan).values({
      pegawaiId: validatedData.pegawaiId,
      jabatanId: validatedData.jabatanId,
      isAktif: validatedData.isAktif,
    });

    revalidatePath('/dashboard/pegawai');
    return {
      success: true,
      message: 'Jabatan berhasil ditambahkan ke pegawai',
    };
  } catch (error: any) {
    console.error('Failed to create pegawai jabatan:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validasi gagal',
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message: 'Gagal menambahkan jabatan pegawai: ' + error.message,
    };
  }
}

export async function deletePegawaiJabatan(id: number) {
  try {
    await db.delete(pegawaiJabatan).where(eq(pegawaiJabatan.id, id));
    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Jabatan pegawai berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus jabatan pegawai: ' + error.message,
    };
  }
}

export async function togglePegawaiJabatanStatus(id: number, isAktif: boolean) {
  try {
    await db
      .update(pegawaiJabatan)
      .set({ isAktif })
      .where(eq(pegawaiJabatan.id, id));
    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Status jabatan berhasil diperbarui' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memperbarui status jabatan: ' + error.message,
    };
  }
}
