'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

const PejabatSchema = z.object({
  idPegawai: z.coerce.number().min(1, 'Pegawai harus dipilih'),
  jenisJabatan: z.string().min(1, 'Jenis Jabatan harus diisi'),
  nomorSk: z.string().min(1, 'Nomor SK harus diisi'),
  tanggalSk: z.coerce.date(),
  keterangan: z.string().optional(),
});

export async function getPejabatList({ page = 1, limit = 10, query = '' }) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const skip = (page - 1) * limit;
  
  // Query logic: filter by pegawai name or jabatan
  const where = {
    isActive: true,
    OR: [
      { pegawai: { nama: { contains: query, mode: 'insensitive' } } },
      { jenisJabatan: { contains: query, mode: 'insensitive' } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.pejabatPengelola.findMany({
        where,
        include: {
            pegawai: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pejabatPengelola.count({ where }),
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
    console.error('Failed to fetch pejabat:', error);
    return { error: 'Failed to fetch data' };
  }
}

export async function createPejabat(formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = PejabatSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields', details: validated.error.flatten() };
  }

  try {
    await prisma.pejabatPengelola.create({
      data: validated.data,
    });

    revalidatePath('/dashboard/pejabat');
    return { success: true, message: 'Pejabat berhasil ditambahkan' };
  } catch (error) {
    return { error: 'Gagal membuat pejabat' };
  }
}

export async function updatePejabat(id, formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = PejabatSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields' };
  }

  try {
    await prisma.pejabatPengelola.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath('/dashboard/pejabat');
    return { success: true, message: 'Pejabat berhasil diupdate' };
  } catch (error) {
    return { error: 'Gagal update pejabat' };
  }
}

export async function deletePejabat(id) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.pejabatPengelola.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath('/dashboard/pejabat');
    return { success: true, message: 'Pejabat berhasil dihapus' };
  } catch (error) {
    return { error: 'Gagal menghapus pejabat' };
  }
}
