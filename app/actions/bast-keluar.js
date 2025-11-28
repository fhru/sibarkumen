'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

const BastKeluarDetailSchema = z.object({
  idBarang: z.number().min(1, 'Barang wajib dipilih'),
  volume: z.coerce.number().min(0, 'Volume wajib diisi'),
  jumlahHarga: z.coerce.number().min(0),
  ppn: z.coerce.number().min(0),
  hargaSetelahPpn: z.coerce.number().min(0),
});

const BastKeluarSchema = z.object({
  nomorBast: z.string().min(1, 'Nomor BAST wajib diisi'),
  tanggalBast: z.date(),
  idSppb: z.number().min(1, 'SPPB wajib dipilih'),
  idPihakMenyerahkan: z.number().min(1, 'Pihak menyerahkan wajib dipilih'),
  idPihakMenerima: z.number().min(1, 'Pihak menerima wajib dipilih'),
  keterangan: z.string().optional(),
  details: z.array(BastKeluarDetailSchema).min(1, 'Minimal satu barang harus ditambahkan'),
});

export async function getBastKeluarList({ page = 1, limit = 10, query = '' }) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const skip = (page - 1) * limit;
  
  const where = {
    OR: [
      { nomorBast: { contains: query, mode: 'insensitive' } },
      { pihakMenerima: { nama: { contains: query, mode: 'insensitive' } } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.bastKeluar.findMany({
        where,
        include: {
            sppb: true,
            pihakMenyerahkan: {
                include: { pegawai: true }
            },
            pihakMenerima: true,
            details: {
                include: { barang: true }
            }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bastKeluar.count({ where }),
    ]);

    // Flatten decimals in details for Client Component safety
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
  } catch (error) {
    console.error('Fetch Error:', error);
    return { error: 'Failed to fetch BAST Keluar' };
  }
}

export async function createBastKeluar(data) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  // Validate
  const validation = BastKeluarSchema.safeParse({
    ...data,
    tanggalBast: new Date(data.tanggalBast),
  });

  if (!validation.success) {
    return { error: 'Validasi gagal', details: validation.error.flatten() };
  }

  const { details, ...header } = validation.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Header
      const bast = await tx.bastKeluar.create({
        data: header,
      });

      // 2. Create Details
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
    return { success: true, message: 'BAST Keluar berhasil dibuat' };
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Gagal membuat BAST Keluar' };
  }
}

// Helper to get SPPB data for selection and population
export async function getSppbOptions(query = '') {
    const session = await auth();
    if (!session) return [];
    
    // Only fetch SPPB that haven't been fully processed? 
    // Or just all. For now, all. 
    // In a real app, you might want to filter out ones that already have a BAST Keluar.
    const where = {
        nomorSppb: { contains: query, mode: 'insensitive' },
        // Check if NOT exists in bast_keluar (Optional, if 1-to-1 relation enforced logic-wise)
        bastKeluarList: {
             none: {}
        }
    };

    const data = await prisma.sppb.findMany({
        where,
        take: 20,
        include: {
            penerima: true,
            details: {
                include: { barang: true }
            },
            pejabatPenatausahaan: true, // usually not needed for BAST fields directly unless reusing
            pengelolaBarang: true, // needed?
        },
        orderBy: { createdAt: 'desc' }
    });
    
    // Flatten decimals
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
