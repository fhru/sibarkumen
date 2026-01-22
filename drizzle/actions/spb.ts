'use server';

import { db } from '@/lib/db';
import { spb, spbDetail, barang, mutasiBarang } from '@/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Helper to check authentication
async function checkAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Zod Schemas
const spbDetailSchema = z.object({
  barangId: z.number(),
  qtyPermintaan: z.number().min(1),
  keterangan: z.string().optional(),
});

const createSPBSchema = z.object({
  nomorSpb: z.string().min(1),
  tanggalSpb: z.union([z.string(), z.date()]),
  pemohonId: z.number(),
  keterangan: z.string().optional(),
  items: z.array(spbDetailSchema).min(1),
});

// Helper to format date
function formatDateForDB(date: string | Date): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function createSPB(
  prevState: any,
  data: z.infer<typeof createSPBSchema>
) {
  try {
    const session = await checkAuth();
    const validated = createSPBSchema.parse(data);

    const tglSpb = formatDateForDB(validated.tanggalSpb);

    await db.transaction(async (tx) => {
      // 1. Create SPB Header
      const [newSpb] = await tx
        .insert(spb)
        .values({
          nomorSpb: validated.nomorSpb,
          tanggalSpb: tglSpb,
          pemohonId: validated.pemohonId,
          keterangan: validated.keterangan,
          status: 'MENUNGGU_SPPB',
        })
        .returning();

      // 2. Create SPB Details
      for (const item of validated.items) {
        await tx.insert(spbDetail).values({
          spbId: newSpb.id,
          barangId: item.barangId,
          qtyPermintaan: item.qtyPermintaan,
          keterangan: item.keterangan,
        });
      }
    });

    revalidatePath('/dashboard/spb');
    return { success: true, message: 'SPB berhasil dibuat' };
  } catch (error: any) {
    // Handle unique constraint errors
    if (error.code === '23505') {
      const errorMessage = error.message || '';
      if (errorMessage.includes('nomor_spb')) {
        return { success: false, message: 'Nomor SPB sudah digunakan' };
      }
    }

    return {
      success: false,
      message: error.message || 'Gagal membuat SPB',
    };
  }
}

export async function updateSPB(
  id: number,
  prevState: any,
  data: z.infer<typeof createSPBSchema>
) {
  try {
    const session = await checkAuth();
    const validated = createSPBSchema.parse(data);

    const tglSpb = formatDateForDB(validated.tanggalSpb);

    await db.transaction(async (tx) => {
      // Check if SPB exists and is editable
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error('SPB tidak ditemukan');
      }

      // Allow edit only if status is MENUNGGU_SPPB
      if (existingSpb.status !== 'MENUNGGU_SPPB') {
        throw new Error('SPB yang sudah diproses tidak dapat diedit');
      }

      // 1. Update SPB Header
      await tx
        .update(spb)
        .set({
          nomorSpb: validated.nomorSpb,
          tanggalSpb: tglSpb,
          pemohonId: validated.pemohonId,
          keterangan: validated.keterangan,
          updatedAt: new Date(),
        })
        .where(eq(spb.id, id));

      // 2. Delete old details
      await tx.delete(spbDetail).where(eq(spbDetail.spbId, id));

      // 3. Insert new details
      for (const item of validated.items) {
        await tx.insert(spbDetail).values({
          spbId: id,
          barangId: item.barangId,
          qtyPermintaan: item.qtyPermintaan,
          keterangan: item.keterangan,
        });
      }
    });

    revalidatePath('/dashboard/spb');
    revalidatePath(`/dashboard/spb/${id}`);
    return { success: true, message: 'SPB berhasil diupdate' };
  } catch (error: any) {
    if (error.code === '23505') {
      const errorMessage = error.message || '';
      if (errorMessage.includes('nomor_spb')) {
        return { success: false, message: 'Nomor SPB sudah digunakan' };
      }
    }

    return {
      success: false,
      message: error.message || 'Gagal mengupdate SPB',
    };
  }
}

export async function deleteSPB(id: number) {
  try {
    await checkAuth();

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error('SPB tidak ditemukan');
      }

      // Delete SPB (cascade will delete details)
      await tx.delete(spb).where(eq(spb.id, id));
    });

    revalidatePath('/dashboard/spb');
    return { success: true, message: 'SPB berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal menghapus SPB',
    };
  }
}

export async function toggleSPBPrintStatus(id: number, isPrinted: boolean) {
  try {
    await checkAuth();

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error('SPB tidak ditemukan');
      }

      await tx
        .update(spb)
        .set({
          isPrinted: isPrinted,
          updatedAt: new Date(),
        })
        .where(eq(spb.id, id));
    });

    revalidatePath('/dashboard/spb');
    revalidatePath(`/dashboard/spb/${id}`);
    const message = isPrinted
      ? 'SPB ditandai sudah dicetak'
      : 'SPB ditandai belum dicetak';
    return { success: true, message };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal mengubah status cetak SPB',
    };
  }
}

export async function cancelSPB(id: number) {
  try {
    await checkAuth();

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error('SPB tidak ditemukan');
      }

      if (existingSpb.status === 'SELESAI') {
        throw new Error('SPB yang sudah selesai tidak dapat dibatalkan');
      }

      await tx
        .update(spb)
        .set({
          status: 'BATAL',
          updatedAt: new Date(),
        })
        .where(eq(spb.id, id));
    });

    revalidatePath('/dashboard/spb');
    revalidatePath(`/dashboard/spb/${id}`);
    return { success: true, message: 'SPB berhasil dibatalkan' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal membatalkan SPB',
    };
  }
}
