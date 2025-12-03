'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { generateDocumentNumber } from '@/lib/number-generator';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const SppbDetailSchema = z.object({
  idBarang: z.number(),
  jumlahDisalurkan: z.number().min(1, 'Jumlah minimal 1'),
});

const SppbSchema = z.object({
  nomorSppb: z.string().optional(),
  tanggalSppb: z.date(),
  idSpb: z.number().min(1, 'SPB wajib dipilih'),
  idPejabatPenatausahaan: z.number().min(1, 'Pejabat Penatausahaan wajib dipilih'),
  idPengelolaBarang: z.number().min(1, 'Pengelola Barang wajib dipilih'),
  idPenerima: z.number().min(1, 'Penerima wajib dipilih'),
  keterangan: z.string().optional(),
  details: z.array(SppbDetailSchema).min(1),
});

// Core fetch functions
async function fetchSppbList({ page = 1, limit = 10, query = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    OR: [
      { nomorSppb: { contains: query, mode: 'insensitive' } },
      { spb: { nomorSpb: { contains: query, mode: 'insensitive' } } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.sppb.findMany({
      where,
      include: {
        spb: true,
        penerima: true,
        details: { include: { barang: true } },
        bastKeluarList: { select: { id: true, nomorBast: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sppb.count({ where }),
  ]);

  const safeData = data.map(item => ({
    ...item,
    hasBast: item.bastKeluarList.length > 0,
    bastId: item.bastKeluarList[0]?.id,
    details: item.details.map(d => ({
      ...d,
      barang: d.barang ? {
        ...d.barang,
        hargaSatuan: d.barang.hargaSatuan.toNumber(),
        totalHarga: d.barang.totalHarga.toNumber()
      } : null
    }))
  }));

  return {
    data: safeData,
    metadata: {
      hasNextPage: skip + limit < total,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
}

async function fetchSpbOptions() {
  const spbs = await prisma.spb.findMany({
    where: { sppbList: { none: {} } },
    orderBy: { createdAt: 'desc' },
    include: {
      pemohon: true,
      details: { include: { barang: true } }
    },
    take: 50
  });
  
  return spbs.map(spb => ({
    ...spb,
    details: spb.details.map(d => ({
      ...d,
      barang: d.barang ? {
        ...d.barang,
        hargaSatuan: d.barang.hargaSatuan.toNumber(),
        totalHarga: d.barang.totalHarga.toNumber()
      } : null
    }))
  }));
}

// Cached versions
const getCachedSppbList = unstable_cache(
  fetchSppbList,
  ['sppb-list'],
  { revalidate: 60, tags: ['sppb'] }
);

const getCachedSpbOptions = unstable_cache(
  fetchSpbOptions,
  ['spb-options'],
  { revalidate: 30, tags: ['spb', 'sppb'] }
);

export async function getSppbList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedSppbList(params);
  } catch (error) {
    logError('getSppbList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data SPPB');
  }
}

export async function getSpbOptions() {
  const session = await auth();
  if (!session) return [];

  try {
    return await getCachedSpbOptions();
  } catch (e) {
    logError('getSpbOptions', e);
    return [];
  }
}

export async function createSppb(data) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validation = SppbSchema.safeParse({
    ...data,
    tanggalSppb: new Date(data.tanggalSppb),
  });

  if (!validation.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal', validation.error.flatten());
  }

  const { details, ...header } = validation.data;

  try {
    if (!header.nomorSppb) {
      header.nomorSppb = await generateDocumentNumber('SPPB', 'sppb', 'tanggalSppb');
    }

    await prisma.$transaction(async (tx) => {
      // Validasi stok SEBELUM insert untuk performa dan logika yang lebih baik
      for (const item of details) {
        const barang = await tx.barang.findUnique({ where: { id: item.idBarang } });
        if (!barang) {
          throw new Error(`Barang ID ${item.idBarang} tidak ditemukan`);
        }
        if (barang.stokTersedia < item.jumlahDisalurkan) {
          throw new Error(`Stok tidak cukup untuk ${barang.namaBarang}. Sisa: ${barang.stokTersedia}`);
        }
      }

      const sppb = await tx.sppb.create({ data: header });

      for (const item of details) {
        await tx.sppbDetail.create({
          data: { idSppb: sppb.id, idBarang: item.idBarang, jumlahDisalurkan: item.jumlahDisalurkan },
        });

        // Update stok barang
        await tx.barang.update({
          where: { id: item.idBarang },
          data: { stokTersedia: { decrement: item.jumlahDisalurkan } }
        });
      }
    });

    revalidatePath('/dashboard/sppb');
    revalidatePath('/dashboard/barang');
    revalidatePath('/dashboard/spb');
    revalidatePath('/dashboard');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('spb');
    revalidateTag('sppb');
    revalidateTag('barang');
    revalidateTag('dashboard');
    return { success: true, message: 'SPPB Berhasil Dibuat' };
  } catch (error) {
    logError('createSppb', error);
    return createError(ErrorTypes.DATABASE_ERROR, error.message || 'Gagal membuat SPPB');
  }
}

export async function revalidateSppbCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('sppb');
}
