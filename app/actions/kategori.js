'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const KategoriSchema = z.object({
  nama: z.string().min(1, 'Nama kategori harus diisi'),
  kode: z.string().min(1, 'Kode kategori harus diisi').toUpperCase(),
});

// Core fetch functions
async function fetchKategoriOptions() {
  return await prisma.referensiKategori.findMany({
    orderBy: { nama: 'asc' },
  });
}

async function fetchKategoriList({ page = 1, limit = 10, query = '' } = {}) {
  const skip = (page - 1) * limit;
  
  const where = {
    OR: [
      { nama: { contains: query, mode: 'insensitive' } },
      { kode: { contains: query, mode: 'insensitive' } },
    ],
  };

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
}

// Cached versions
const getCachedKategoriOptions = unstable_cache(
  fetchKategoriOptions,
  ['kategori-options'],
  { revalidate: 60, tags: ['kategori'] }
);

const getCachedKategoriList = unstable_cache(
  fetchKategoriList,
  ['kategori-list'],
  { revalidate: 60, tags: ['kategori'] }
);

export async function getKategoriOptions() {
  const session = await auth();
  if (!session) return [];

  try {
    return await getCachedKategoriOptions();
  } catch (e) {
    logError('getKategoriOptions', e);
    return [];
  }
}

export async function getKategoriList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedKategoriList(params);
  } catch (error) {
    logError('getKategoriList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data kategori');
  }
}

export async function createKategori(formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = KategoriSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal', validated.error.flatten());
  }

  try {
    await prisma.referensiKategori.create({ data: validated.data });
    revalidatePath('/dashboard/kategori');
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Kategori berhasil ditambahkan' };
  } catch (error) {
    if (error.code === 'P2002') {
      return createError(ErrorTypes.CONFLICT, 'Kode atau Nama kategori sudah ada');
    }
    logError('createKategori', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal membuat kategori');
  }
}

export async function updateKategori(id, formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = KategoriSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal');
  }

  try {
    await prisma.referensiKategori.update({ where: { id }, data: validated.data });
    revalidatePath('/dashboard/kategori');
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Kategori berhasil diupdate' };
  } catch (error) {
    if (error.code === 'P2002') {
      return createError(ErrorTypes.CONFLICT, 'Kode atau Nama kategori sudah ada');
    }
    logError('updateKategori', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal update kategori');
  }
}

export async function deleteKategori(id) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    // Cek apakah kategori sedang digunakan oleh barang
    const kategori = await prisma.referensiKategori.findUnique({ where: { id } });
    if (!kategori) return createError(ErrorTypes.NOT_FOUND, 'Kategori tidak ditemukan');

    const usedByBarang = await prisma.barang.count({
      where: { kategori: kategori.nama, isActive: true }
    });

    if (usedByBarang > 0) {
      return createError(ErrorTypes.CONFLICT, `Kategori masih digunakan oleh ${usedByBarang} barang aktif`);
    }

    await prisma.referensiKategori.delete({ where: { id } });
    revalidatePath('/dashboard/kategori');
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Kategori berhasil dihapus' };
  } catch (error) {
    logError('deleteKategori', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal menghapus kategori');
  }
}

export async function revalidateKategoriCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('kategori');
}
