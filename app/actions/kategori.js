'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

const KategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori harus diisi'),
  kode: z.string().min(1, 'Kode kategori harus diisi').toUpperCase(),
});

export async function getKategoriOptions() {
  try {
    return await prisma.referensiKategori.findMany({
      orderBy: { nama: 'asc' },
    });
  } catch (e) {
    return [];
  }
}

export async function getKategoriList({ page = 1, limit = 10, query = '' } = {}) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const skip = (page - 1) * limit;
  
  const where = {
    OR: [
      { nama: { contains: query, mode: 'insensitive' } },
      { kode: { contains: query, mode: 'insensitive' } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.referensiKategori.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.referensiKategori.count({ where }),
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
    return { error: 'Failed to fetch kategori' };
  }
}

export async function createKategori(formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = KategoriSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Validasi gagal', details: validated.error.flatten() };
  }

  try {
    await prisma.referensiKategori.create({
      data: validated.data,
    });

    revalidatePath('/dashboard/kategori');
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Kategori berhasil ditambahkan' };
  } catch (error) {
    // Unique constraint violation
    if (error.code === 'P2002') {
        return { error: 'Kode atau Nama kategori sudah ada' };
    }
    return { error: 'Gagal membuat kategori' };
  }
}

export async function updateKategori(id, formData) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    const validated = KategoriSchema.safeParse(formData);
  
    if (!validated.success) {
      return { error: 'Validasi gagal' };
    }
  
    try {
      await prisma.referensiKategori.update({
        where: { id },
        data: validated.data,
      });
  
      revalidatePath('/dashboard/kategori');
      revalidatePath('/dashboard/barang');
      return { success: true, message: 'Kategori berhasil diupdate' };
    } catch (error) {
      if (error.code === 'P2002') {
          return { error: 'Kode atau Nama kategori sudah ada' };
      }
      return { error: 'Gagal update kategori' };
    }
}
  
export async function deleteKategori(id) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    try {
      await prisma.referensiKategori.delete({
        where: { id },
      });
      revalidatePath('/dashboard/kategori');
      revalidatePath('/dashboard/barang');
      return { success: true, message: 'Kategori berhasil dihapus' };
    } catch (error) {
      return { error: 'Gagal menghapus kategori' };
    }
}
