'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const RekeningSchema = z.object({
  namaBank: z.string().min(1, 'Nama Bank wajib diisi'),
  kodeBank: z.string().min(1, 'Kode Bank wajib diisi'),
  nomorRekening: z.string().min(1, 'Nomor Rekening wajib diisi'),
  namaPemilik: z.string().min(1, 'Nama Pemilik wajib diisi'),
  jenisRekening: z.string().min(1, 'Jenis Rekening wajib diisi'),
  keterangan: z.string().optional(),
});

// Core fetch functions
async function fetchRekeningList({ page = 1, limit = 10, query = '' } = {}) {
  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { namaBank: { contains: query, mode: 'insensitive' } },
      { nomorRekening: { contains: query, mode: 'insensitive' } },
      { namaPemilik: { contains: query, mode: 'insensitive' } },
    ],
  };

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
}

async function fetchAllRekening() {
  return await prisma.rekening.findMany({
    where: { isActive: true },
    orderBy: { namaBank: 'asc' },
  });
}

// Cached versions
const getCachedRekeningList = unstable_cache(
  fetchRekeningList,
  ['rekening-list'],
  { revalidate: 60, tags: ['rekening'] }
);

const getCachedAllRekening = unstable_cache(
  fetchAllRekening,
  ['rekening-all'],
  { revalidate: 60, tags: ['rekening'] }
);

export async function getRekeningList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedRekeningList(params);
  } catch (error) {
    logError('getRekeningList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data rekening');
  }
}

export async function getAllRekening() {
  const session = await auth();
  if (!session) return [];

  try {
    return await getCachedAllRekening();
  } catch (error) {
    logError('getAllRekening', error);
    return [];
  }
}

export async function createRekening(formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = RekeningSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal', validated.error.flatten());
  }

  try {
    await prisma.rekening.create({ data: validated.data });
    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil ditambahkan' };
  } catch (error) {
    logError('createRekening', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal membuat rekening');
  }
}

export async function updateRekening(id, formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = RekeningSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal');
  }

  try {
    await prisma.rekening.update({ where: { id }, data: validated.data });
    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil diupdate' };
  } catch (error) {
    logError('updateRekening', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal update rekening');
  }
}

export async function deleteRekening(id) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    await prisma.rekening.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/dashboard/rekening');
    return { success: true, message: 'Rekening berhasil dihapus' };
  } catch (error) {
    logError('deleteRekening', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal menghapus rekening');
  }
}

export async function revalidateRekeningCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('rekening');
}
