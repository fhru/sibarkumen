'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { ErrorTypes, createError, logError } from '@/lib/error-types';

const BastMasukDetailSchema = z.object({
  idBarang: z.number().min(1, 'Barang wajib dipilih'),
  jumlah: z.number().min(1, 'Jumlah minimal 1'),
  hargaSatuan: z.number().min(0, 'Harga satuan tidak boleh negatif'),
  totalHarga: z.number().min(0),
});

const BastMasukSchema = z.object({
  nomorBast: z.string().min(1, 'Nomor BAST wajib diisi'),
  tanggalBast: z.date(),
  nomorBapb: z.string().min(1, 'Nomor BAPB wajib diisi'),
  tanggalBapb: z.date(),
  asalPembelian: z.string().min(1, 'Asal Pembelian wajib diisi'),
  idRekening: z.number().min(1, 'Rekening wajib dipilih'),
  pptkPpkId: z.number().min(1, 'PPTK/PPK wajib dipilih'),
  pihakKetiga: z.string().optional(),
  keterangan: z.string().optional(),
  nomorReferensi: z.string().optional().default('-'),
  details: z.array(BastMasukDetailSchema).min(1, 'Minimal satu barang harus ditambahkan'),
});

// Core fetch function
async function fetchBastMasukList({ page = 1, limit = 10, query = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    OR: [
      { nomorBast: { contains: query, mode: 'insensitive' } },
      { pihakKetiga: { contains: query, mode: 'insensitive' } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.bastMasuk.findMany({
      where,
      include: {
        pptkPpk: true,
        rekening: true,
        details: { include: { barang: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bastMasuk.count({ where }),
  ]);

  const safeData = data.map(item => ({
    ...item,
    details: item.details.map(d => ({
      ...d,
      hargaSatuan: d.hargaSatuan.toNumber(),
      totalHarga: d.totalHarga.toNumber(),
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

// Cached version
const getCachedBastMasukList = unstable_cache(
  fetchBastMasukList,
  ['bast-masuk-list'],
  { revalidate: 60, tags: ['bast-masuk'] }
);

export async function getBastMasukList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  try {
    return await getCachedBastMasukList(params);
  } catch (error) {
    logError('getBastMasukList', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal mengambil data BAST Masuk');
  }
}

export async function createBastMasuk(data) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, 'Anda harus login');

  const validation = BastMasukSchema.safeParse({
    ...data,
    tanggalBast: new Date(data.tanggalBast),
    tanggalBapb: new Date(data.tanggalBapb),
  });

  if (!validation.success) {
    return createError(ErrorTypes.VALIDATION_ERROR, 'Validasi gagal', validation.error.flatten());
  }

  const { details, ...header } = validation.data;

  try {
    await prisma.$transaction(async (tx) => {
      const bast = await tx.bastMasuk.create({ data: header });

      for (const item of details) {
        await tx.bastMasukDetail.create({
          data: {
            idBastMasuk: bast.id,
            idBarang: item.idBarang,
            jumlah: item.jumlah,
            hargaSatuan: item.hargaSatuan,
            totalHarga: item.totalHarga,
          },
        });

        const currentBarang = await tx.barang.findUnique({ where: { id: item.idBarang } });
        if (currentBarang) {
          const newStock = currentBarang.stokTersedia + item.jumlah;
          await tx.barang.update({
            where: { id: item.idBarang },
            data: {
              stokTersedia: newStock,
              hargaSatuan: item.hargaSatuan,
              totalHarga: newStock * item.hargaSatuan
            }
          });
        }
      }
    });

    revalidatePath('/dashboard/bast-masuk');
    revalidatePath('/dashboard/barang');
    revalidatePath('/dashboard');
    return { success: true, message: 'BAST Masuk berhasil disimpan' };
  } catch (error) {
    logError('createBastMasuk', error);
    return createError(ErrorTypes.DATABASE_ERROR, 'Gagal menyimpan transaksi BAST Masuk');
  }
}

export async function revalidateBastMasukCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('bast-masuk');
}
