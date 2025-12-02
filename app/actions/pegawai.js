'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const PegawaiSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  nip: z.string().min(1, 'NIP harus diisi'),
  jabatan: z.string().min(1, 'Jabatan harus diisi'),
  unitKerja: z.string().min(1, 'Unit Kerja harus diisi'),
  keterangan: z.string().optional(),
});

// Core fetch functions
async function fetchPegawaiList({ page = 1, limit = 10, query = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { nama: { contains: query, mode: 'insensitive' } },
      { nip: { contains: query, mode: 'insensitive' } },
    ],
  };

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
}

async function fetchAllPegawai() {
  return await prisma.pegawai.findMany({
    where: { isActive: true },
    orderBy: { nama: 'asc' }
  });
}

// Cached versions
const getCachedPegawaiList = unstable_cache(
  fetchPegawaiList,
  ['pegawai-list'],
  { revalidate: 60, tags: ['pegawai'] }
);

const getCachedAllPegawai = unstable_cache(
  fetchAllPegawai,
  ['pegawai-all'],
  { revalidate: 60, tags: ['pegawai'] }
);

export async function getPegawaiList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedPegawaiList(params);
  } catch (error) {
    logError('getPegawaiList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data pegawai');
  }
}

export async function getAllPegawai() {
  try {
    return await getCachedAllPegawai();
  } catch (e) {
    logError('getAllPegawai', e);
    return [];
  }
}

export async function createPegawai(formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = PegawaiSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Data tidak valid', validated.error.flatten());
  }

  try {
    const existing = await prisma.pegawai.findFirst({
      where: { nip: validated.data.nip, isActive: true },
    });

    if (existing) {
      return createError(ErrorTypes.CONFLICT, 'NIP sudah terdaftar');
    }

    await prisma.pegawai.create({ data: validated.data });

    revalidatePath('/dashboard/pegawai');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pegawai');
    return { success: true, message: 'Pegawai berhasil ditambahkan' };
  } catch (error) {
    logError('createPegawai', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal membuat pegawai');
  }
}

export async function updatePegawai(id, formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = PegawaiSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Data tidak valid');
  }

  try {
    await prisma.pegawai.update({ where: { id }, data: validated.data });
    revalidatePath('/dashboard/pegawai');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pegawai');
    return { success: true, message: 'Pegawai berhasil diupdate' };
  } catch (error) {
    logError('updatePegawai', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal update pegawai');
  }
}

export async function deletePegawai(id) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    await prisma.pegawai.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/dashboard/pegawai');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('pegawai');
    return { success: true, message: 'Pegawai berhasil dihapus' };
  } catch (error) {
    logError('deletePegawai', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal menghapus pegawai');
  }
}

export async function revalidatePegawaiCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('pegawai');
}

// Optimized options fetcher for dropdowns (minimal fields)
async function fetchPegawaiOptions() {
  return prisma.pegawai.findMany({
    where: { isActive: true },
    select: {
      id: true,
      nama: true,
      nip: true,
      jabatan: true,
    },
    orderBy: { nama: 'asc' }
  });
}

const getCachedPegawaiOptions = unstable_cache(
  fetchPegawaiOptions,
  ['pegawai-options'],
  { revalidate: 60, tags: ['pegawai'] }
);

export async function getPegawaiOptions() {
  try {
    return await getCachedPegawaiOptions();
  } catch (error) {
    logError('getPegawaiOptions', error);
    return [];
  }
}
