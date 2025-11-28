'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

const PegawaiSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  nip: z.string().min(1, 'NIP harus diisi'),
  jabatan: z.string().min(1, 'Jabatan harus diisi'),
  unitKerja: z.string().min(1, 'Unit Kerja harus diisi'),
  keterangan: z.string().optional(),
});

export async function getPegawaiList({ page = 1, limit = 10, query = '' }) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { nama: { contains: query, mode: 'insensitive' } },
      { nip: { contains: query, mode: 'insensitive' } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.pegawai.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      prisma.pegawai.count({ where }),
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
    console.error('Failed to fetch pegawai:', error);
    return { error: 'Failed to fetch data' };
  }
}

export async function getAllPegawai() {
    // Helper for dropdowns
    try {
        return await prisma.pegawai.findMany({
            where: { isActive: true },
            orderBy: { nama: 'asc' }
        });
    } catch (e) {
        return [];
    }
}

export async function createPegawai(formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = PegawaiSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields', details: validated.error.flatten() };
  }

  try {
    const existing = await prisma.pegawai.findFirst({
      where: { nip: validated.data.nip, isActive: true },
    });

    if (existing) {
      return { error: 'NIP sudah terdaftar' };
    }

    await prisma.pegawai.create({
      data: validated.data,
    });

    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Pegawai berhasil ditambahkan' };
  } catch (error) {
    return { error: 'Gagal membuat pegawai' };
  }
}

export async function updatePegawai(id, formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = PegawaiSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields' };
  }

  try {
    await prisma.pegawai.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Pegawai berhasil diupdate' };
  } catch (error) {
    return { error: 'Gagal update pegawai' };
  }
}

export async function deletePegawai(id) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.pegawai.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath('/dashboard/pegawai');
    return { success: true, message: 'Pegawai berhasil dihapus' };
  } catch (error) {
    return { error: 'Gagal menghapus pegawai' };
  }
}
