'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const PejabatSchema = z.object({
  idPegawai: z.coerce.number().min(1, 'Pegawai harus dipilih'),
  jenisJabatan: z.string().min(1, 'Jenis Jabatan harus diisi'),
  nomorSk: z.string().min(1, 'Nomor SK harus diisi'),
  tanggalSk: z.coerce.date(),
  keterangan: z.string().optional(),
});

// Core fetch function
async function fetchPejabatList({ page = 1, limit = 10, query = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { pegawai: { nama: { contains: query, mode: 'insensitive' } } },
      { jenisJabatan: { contains: query, mode: 'insensitive' } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.pejabatPengelola.findMany({
      where,
      include: { pegawai: true },
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
}

// Cached version
const getCachedPejabatList = unstable_cache(
  fetchPejabatList,
  ['pejabat-list'],
  { revalidate: 60, tags: ['pejabat'] }
);

export async function getPejabatList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedPejabatList(params);
  } catch (error) {
    logError('getPejabatList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data pejabat');
  }
}

export async function createPejabat(formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = PejabatSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Data tidak valid', validated.error.flatten());
  }

  try {
    await prisma.pejabatPengelola.create({ data: validated.data });
    revalidatePath('/dashboard/pejabat');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pejabat');
    return { success: true, message: 'Pejabat berhasil ditambahkan' };
  } catch (error) {
    logError('createPejabat', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal membuat pejabat');
  }
}

export async function updatePejabat(id, formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = PejabatSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Data tidak valid');
  }

  try {
    await prisma.pejabatPengelola.update({ where: { id }, data: validated.data });
    revalidatePath('/dashboard/pejabat');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pejabat');
    return { success: true, message: 'Pejabat berhasil diupdate' };
  } catch (error) {
    logError('updatePejabat', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal update pejabat');
  }
}

export async function deletePejabat(id) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    await prisma.pejabatPengelola.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/dashboard/pejabat');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pejabat');
    return { success: true, message: 'Pejabat berhasil dihapus' };
  } catch (error) {
    logError('deletePejabat', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal menghapus pejabat');
  }
}

export async function revalidatePejabatCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('pejabat');
}

// Optimized options fetcher for dropdowns (minimal fields)
async function fetchPejabatOptions() {
  return prisma.pejabatPengelola.findMany({
    where: { isActive: true },
    select: {
      id: true,
      jenisJabatan: true,
      pegawai: {
        select: { id: true, nama: true, jabatan: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

const getCachedPejabatOptions = unstable_cache(
  fetchPejabatOptions,
  ['pejabat-options'],
  { revalidate: 60, tags: ['pejabat'] }
);

export async function getPejabatOptions() {
  try {
    return await getCachedPejabatOptions();
  } catch (error) {
    logError('getPejabatOptions', error);
    return [];
  }
}
