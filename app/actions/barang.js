'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const BarangSchema = z.object({
  kodeBarang: z.string().optional(),
  namaBarang: z.string().min(1, 'Nama barang harus diisi'),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  satuan: z.string().min(1, 'Satuan harus diisi'),
  spesifikasi: z.string().optional(),
  asalPembelian: z.string().min(1, 'Asal pembelian harus diisi'),
  stokMinimum: z.coerce.number().min(0, 'Stok minimum tidak boleh negatif'),
  hargaSatuan: z.coerce.number().min(0, 'Harga satuan tidak boleh negatif'),
});

// Core fetch functions
async function fetchBarangList({ page = 1, limit = 10, query = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { namaBarang: { contains: query, mode: 'insensitive' } },
      { kodeBarang: { contains: query, mode: 'insensitive' } },
      { kategori: { contains: query, mode: 'insensitive' } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.barang.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.barang.count({ where }),
  ]);

  return {
    data: data.map((item) => ({
      ...item,
      hargaSatuan: item.hargaSatuan.toNumber(),
      totalHarga: item.totalHarga.toNumber(),
    })),
    metadata: {
      hasNextPage: skip + limit < total,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
}

async function fetchBarangById(id) {
  return await prisma.barang.findUnique({ where: { id } });
}

async function fetchBarangHistory(id) {
  const [inbound, outbound] = await Promise.all([
    prisma.bastMasukDetail.findMany({
      where: { idBarang: id },
      include: { bastMasuk: true },
      orderBy: { bastMasuk: { tanggalBast: 'desc' } }
    }),
    prisma.sppbDetail.findMany({
      where: { idBarang: id },
      include: { sppb: { include: { penerima: true } } },
      orderBy: { sppb: { tanggalSppb: 'desc' } }
    })
  ]);

  const formattedIn = inbound.map(item => ({
    id: `IN-${item.id}`,
    date: item.bastMasuk.tanggalBast,
    docNumber: item.bastMasuk.nomorBast,
    type: 'MASUK',
    quantity: item.jumlah,
    actor: item.bastMasuk.pihakKetiga || 'Pihak Ketiga',
    description: 'Pembelian / Penerimaan'
  }));

  const formattedOut = outbound.map(item => ({
    id: `OUT-${item.id}`,
    date: item.sppb.tanggalSppb,
    docNumber: item.sppb.nomorSppb,
    type: 'KELUAR',
    quantity: item.jumlahDisalurkan,
    actor: item.sppb.penerima?.nama || 'Penerima',
    description: 'Penyaluran Barang'
  }));

  return [...formattedIn, ...formattedOut].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Cached versions
const getCachedBarangList = unstable_cache(
  fetchBarangList,
  ['barang-list'],
  { revalidate: 60, tags: ['barang'] }
);

const getCachedBarangHistory = unstable_cache(
  fetchBarangHistory,
  ['barang-history'],
  { revalidate: 60, tags: ['barang'] }
);

// Exported functions
export async function getBarangList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedBarangList(params);
  } catch (error) {
    logError('getBarangList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data barang');
  }
}

export async function getBarangStock(id) {
  const session = await auth();
  if (!session) return 0;

  try {
    const item = await prisma.barang.findUnique({
      where: { id },
      select: { stokTersedia: true }
    });
    return item ? item.stokTersedia : 0;
  } catch (e) {
    return 0;
  }
}

export async function getBarangById(id) {
  const session = await auth();
  if (!session) return null;

  try {
    return await fetchBarangById(id);
  } catch (error) {
    logError('getBarangById', error);
    return null;
  }
}

export async function getBarangHistory(id) {
  const session = await auth();
  if (!session) return [];

  try {
    return await getCachedBarangHistory(id);
  } catch (error) {
    logError('getBarangHistory', error);
    return [];
  }
}

export async function createBarang(formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = BarangSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Data tidak valid', validated.error.flatten());
  }

  const { namaBarang, kategori, satuan, spesifikasi, asalPembelian, stokMinimum, hargaSatuan } = validated.data;

  try {
    const refKategori = await prisma.referensiKategori.findUnique({ where: { kode: kategori } });
    if (!refKategori) return createError(ErrorTypes.VALIDATION_ERROR, 'Kategori tidak valid');

    const prefix = refKategori.kode;
    const lastItem = await prisma.barang.findFirst({
      where: { kodeBarang: { startsWith: prefix + '-' } },
      orderBy: { kodeBarang: 'desc' },
    });

    let nextNum = 1;
    if (lastItem) {
      const parts = lastItem.kodeBarang.split('-');
      if (parts.length === 2) {
        const currentNum = parseInt(parts[1], 10);
        if (!isNaN(currentNum)) nextNum = currentNum + 1;
      }
    }
    const kodeBarang = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    await prisma.barang.create({
      data: {
        kodeBarang,
        namaBarang,
        kategori: refKategori.nama,
        satuan,
        spesifikasi,
        asalPembelian,
        stokMinimum,
        hargaSatuan,
        totalHarga: 0,
        stokTersedia: 0,
      },
    });

    revalidatePath('/dashboard/barang');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('barang');
    return { success: true, message: 'Barang berhasil ditambahkan' };
  } catch (error) {
    logError('createBarang', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal membuat barang');
  }
}

export async function updateBarang(id, formData) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validated = BarangSchema.safeParse(formData);
  if (!validated.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Data tidak valid');
  }

  try {
    const existingItem = await prisma.barang.findUnique({ where: { id } });
    if (!existingItem) return createError(ErrorTypes.NOT_FOUND, 'Barang tidak ditemukan');

    const totalHarga = existingItem.stokTersedia * validated.data.hargaSatuan;
    
    let categoryToUpdate = validated.data.kategori;
    const refKategori = await prisma.referensiKategori.findUnique({ where: { kode: validated.data.kategori } });
    if (refKategori) categoryToUpdate = refKategori.nama;

    await prisma.barang.update({
      where: { id },
      data: { ...validated.data, kategori: categoryToUpdate, totalHarga },
    });

    revalidatePath('/dashboard/barang');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('barang');
    return { success: true, message: 'Barang berhasil diupdate' };
  } catch (error) {
    logError('updateBarang', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal update barang');
  }
}

export async function deleteBarang(id) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    await prisma.barang.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/dashboard/barang');
    const { revalidateTag } = await import('next/cache');
    revalidateTag('barang');
    return { success: true, message: 'Barang berhasil dihapus' };
  } catch (error) {
    logError('deleteBarang', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal menghapus barang');
  }
}

export async function revalidateBarangCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('barang');
}

// Optimized options fetcher for dropdowns (minimal fields)
async function fetchBarangOptions() {
  const data = await prisma.barang.findMany({
    where: { isActive: true },
    select: {
      id: true,
      kodeBarang: true,
      namaBarang: true,
      satuan: true,
      stokTersedia: true,
      hargaSatuan: true,
    },
    orderBy: { namaBarang: 'asc' },
    take: 500
  });
  
  // Konversi Decimal sebelum di-cache
  return data.map(item => ({
    ...item,
    hargaSatuan: item.hargaSatuan.toNumber()
  }));
}

const getCachedBarangOptions = unstable_cache(
  fetchBarangOptions,
  ['barang-options'],
  { revalidate: 60, tags: ['barang'] }
);

export async function getBarangOptions() {
  try {
    return await getCachedBarangOptions();
  } catch (error) {
    logError('getBarangOptions', error);
    return [];
  }
}
