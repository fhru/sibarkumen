'use server';

import { db } from '@/lib/db';
import { spb, spbDetail, barang, mutasiBarang } from '@/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

import { authClient } from '@/lib/auth-client';
import { getSession, getCurrentPegawai } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';

// Helper to check authentication
async function checkAuth() {
  const session = await getSession();
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

    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      throw new Error('Supervisor tidak dapat membuat SPB');
    }

    let pemohonId = validated.pemohonId;

    if (userRole === 'petugas') {
      const profile = await getCurrentPegawai();
      if (!profile) {
        throw new Error('Profil pegawai tidak ditemukan. Harap hubungi admin.');
      }
      pemohonId = profile.id;
    }

    const tglSpb = formatDateForDB(validated.tanggalSpb);

    await db.transaction(async (tx) => {
      // 1. Create SPB Header
      const [newSpb] = await tx
        .insert(spb)
        .values({
          nomorSpb: validated.nomorSpb,
          tanggalSpb: tglSpb,
          pemohonId: pemohonId,
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

    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      throw new Error('Supervisor tidak dapat mengedit SPB');
    }

    let pemohonId = validated.pemohonId;

    if (userRole === 'petugas') {
      const profile = await getCurrentPegawai();
      if (!profile) {
        throw new Error('Profil pegawai tidak ditemukan. Harap hubungi admin.');
      }
      pemohonId = profile.id;
    }

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

      // Check ownership for petugas
      if (userRole === 'petugas' && existingSpb.pemohonId !== pemohonId) {
        throw new Error('Anda tidak memiliki izin untuk mengedit SPB ini');
      }

      // 1. Update SPB Header
      await tx
        .update(spb)
        .set({
          nomorSpb: validated.nomorSpb,
          tanggalSpb: tglSpb,
          pemohonId: pemohonId,
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
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      throw new Error('Supervisor tidak dapat menghapus SPB');
    }

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error('SPB tidak ditemukan');
      }

      // Check ownership for petugas
      if (userRole === 'petugas') {
        const profile = await getCurrentPegawai();
        if (!profile || existingSpb.pemohonId !== profile.id) {
          throw new Error('Anda tidak memiliki izin untuk menghapus SPB ini');
        }
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
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || 'petugas';

    // If role is Supervisor, they can NEVER toggle print status
    if (userRole === 'supervisor') {
      throw new Error(
        'Anda tidak memiliki izin untuk mengubah status cetak SPB'
      );
    }

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error('SPB tidak ditemukan');
      }

      // Special check for petugas: Can only toggle if status is SELESAI
      if (userRole === 'petugas' && existingSpb.status !== 'SELESAI') {
        throw new Error(
          'Anda tidak memiliki izin untuk mengubah status cetak SPB ini (Status belum SELESAI)'
        );
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
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor' || userRole === 'petugas') {
      throw new Error('Anda tidak memiliki izin untuk membatalkan SPB');
    }

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
