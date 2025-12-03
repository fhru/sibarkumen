'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { generateDocumentNumber } from '@/lib/number-generator';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const BastKeluarDetailSchema = z.object({
  idBarang: z.number().min(1, 'Barang wajib dipilih'),
  volume: z.coerce.number().min(0, 'Volume wajib diisi'),
  jumlahHarga: z.coerce.number().min(0),
  ppn: z.coerce.number().min(0),
  hargaSetelahPpn: z.coerce.number().min(0),
});

const BastKeluarSchema = z.object({
  nomorBast: z.string().optional(),
  tanggalBast: z.date(),
  idSppb: z.number().min(1, 'SPPB wajib dipilih'),
  idPihakMenyerahkan: z.number().min(1, 'Pihak menyerahkan wajib dipilih'),
  idPihakMenerima: z.number().min(1, 'Pihak menerima wajib dipilih'),
  keterangan: z.string().optional(),
  details: z.array(BastKeluarDetailSchema).min(1, 'Minimal satu barang harus ditambahkan'),
});

// Core fetch functions
async function fetchBastKeluarList({ page = 1, limit = 10, query = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    OR: [
      { nomorBast: { contains: query, mode: 'insensitive' } },
      { pihakMenerima: { nama: { contains: query, mode: 'insensitive' } } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.bastKeluar.findMany({
      where,
      include: {
        sppb: true,
        pihakMenyerahkan: { include: { pegawai: true } },
        pihakMenerima: true,
        details: { include: { barang: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bastKeluar.count({ where }),
  ]);

  const safeData = data.map(item => ({
    ...item,
    details: item.details.map(d => ({
      ...d,
      volume: d.volume.toNumber(),
      jumlahHarga: d.jumlahHarga.toNumber(),
      ppn: d.ppn.toNumber(),
      hargaSetelahPpn: d.hargaSetelahPpn.toNumber(),
      barang: {
        ...d.barang,
        hargaSatuan: d.barang.hargaSatuan.toNumber(),
        totalHarga: d.barang.totalHarga.toNumber()
      }
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

async function fetchSppbOptions(query = '') {
  const where = {
    nomorSppb: { contains: query, mode: 'insensitive' },
    bastKeluarList: { none: {} }
  };

  const data = await prisma.sppb.findMany({
    where,
    take: 20,
    include: {
      penerima: true,
      details: { include: { barang: true } },
      pejabatPenatausahaan: true,
      pengelolaBarang: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return data.map(item => ({
    ...item,
    details: item.details.map(d => ({
      ...d,
      barang: {
        ...d.barang,
        hargaSatuan: d.barang.hargaSatuan.toNumber(),
        totalHarga: d.barang.totalHarga.toNumber()
      }
    }))
  }));
}

// Cached versions
const getCachedBastKeluarList = unstable_cache(
  fetchBastKeluarList,
  ['bast-keluar-list'],
  { revalidate: 60, tags: ['bast-keluar'] }
);

const getCachedSppbOptions = unstable_cache(
  fetchSppbOptions,
  ['sppb-options'],
  { revalidate: 30, tags: ['sppb', 'bast-keluar'] }
);

export async function getBastKeluarList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedBastKeluarList(params);
  } catch (error) {
    logError('getBastKeluarList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data BAST Keluar');
  }
}

export async function getSppbOptions(query = '') {
  const session = await auth();
  if (!session) return [];
  
  try {
    return await getCachedSppbOptions(query);
  } catch (e) {
    logError('getSppbOptions', e);
    return [];
  }
}

export async function createBastKeluar(data) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validation = BastKeluarSchema.safeParse({
    ...data,
    tanggalBast: new Date(data.tanggalBast),
  });

  if (!validation.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal', validation.error.flatten());
  }

  const { details, ...header } = validation.data;

  try {
    if (!header.nomorBast) {
      header.nomorBast = await generateDocumentNumber('BAST-KELUAR', 'bastKeluar', 'tanggalBast');
    }

    await prisma.$transaction(async (tx) => {
      const bast = await tx.bastKeluar.create({ data: header });

      for (const item of details) {
        await tx.bastKeluarDetail.create({
          data: {
            idBast: bast.id,
            idBarang: item.idBarang,
            volume: item.volume,
            jumlahHarga: item.jumlahHarga,
            ppn: item.ppn,
            hargaSetelahPpn: item.hargaSetelahPpn,
          },
        });
      }
    });

    revalidatePath('/dashboard/bast-keluar');
    revalidatePath('/dashboard/sppb');
    revalidatePath('/dashboard');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('sppb');
    revalidateTag('bast-keluar');
    revalidateTag('dashboard');
    return { success: true, message: 'BAST Keluar berhasil dibuat' };
  } catch (error) {
    logError('createBastKeluar', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal membuat BAST Keluar');
  }
}

export async function revalidateBastKeluarCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('bast-keluar');
}
