'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

const RekeningSchema = z.object({
  namaBank: z.string().min(1, 'Nama Bank wajib diisi'),
  kodeBank: z.string().min(1, 'Kode Bank wajib diisi'),
  nomorRekening: z.string().min(1, 'Nomor Rekening wajib diisi'),
  namaPemilik: z.string().min(1, 'Nama Pemilik wajib diisi'),
  jenisRekening: z.string().min(1, 'Jenis Rekening wajib diisi'),
  keterangan: z.string().optional(),
});

export async function getRekeningList({ page = 1, limit = 10, query = '' } = {}) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { namaBank: { contains: query, mode: 'insensitive' } },
      { nomorRekening: { contains: query, mode: 'insensitive' } },
      { namaPemilik: { contains: query, mode: 'insensitive' } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.rekening.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rekening.count({ where }),
    ]);

    return {
      data,
      metadata: {
        hasNextPage: skip + limit < total,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  } catch (error) {
    console.error('Fetch Error:', error);
    return { error: 'Failed to fetch Rekening' };
  }
}

export async function createRekening(formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = RekeningSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Validasi gagal', details: validated.error.flatten() };
  }

  try {
    await prisma.rekening.create({
      data: validated.data,
    });

    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil ditambahkan' };
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Gagal membuat rekening' };
  }
}

export async function updateRekening(id, formData) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    const validated = RekeningSchema.safeParse(formData);
  
    if (!validated.success) {
      return { error: 'Validasi gagal' };
    }
  
    try {
      await prisma.rekening.update({
        where: { id },
        data: validated.data,
      });
  
      revalidatePath('/dashboard/rekening');
      return { success: true, message: 'Rekening berhasil diupdate' };
    } catch (error) {
      return { error: 'Gagal update rekening' };
    }
}
  
export async function deleteRekening(id) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    try {
      await prisma.rekening.update({
        where: { id },
        data: { isActive: false },
      });
      revalidatePath('/dashboard/rekening');
      return { success: true, message: 'Rekening berhasil dihapus' };
    } catch (error) {
      return { error: 'Gagal menghapus rekening' };
    }
}
