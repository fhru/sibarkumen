'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { generateDocumentNumber } from '@/lib/number-generator';

const SpbDetailSchema = z.object({
  idBarang: z.number().min(1, 'Barang wajib dipilih'),
  jumlah: z.number().min(1, 'Jumlah minimal 1'),
});

const SpbSchema = z.object({
  nomorSpb: z.string().optional(),
  tanggalSpb: z.date(),
  pemohonId: z.number().min(1, 'Pemohon wajib dipilih'),
  keterangan: z.string().optional(),
  details: z.array(SpbDetailSchema).min(1, 'Minimal satu barang harus ditambahkan'),
});

export async function createSpb(data) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  // Validate
  const validation = SpbSchema.safeParse({
    ...data,
    tanggalSpb: new Date(data.tanggalSpb),
  });

  if (!validation.success) {
    return { error: 'Validasi gagal', details: validation.error.flatten() };
  }

  const { details, ...header } = validation.data;

  try {
    // Auto-generate number if empty
    if (!header.nomorSpb) {
        header.nomorSpb = await generateDocumentNumber('SPB', 'spb', 'tanggalSpb');
    }

    // Check stock availability
    for (const item of details) {
        const barang = await prisma.barang.findUnique({ where: { id: item.idBarang } });
        if (!barang) return { error: `Barang ID ${item.idBarang} tidak ditemukan` };
        if (barang.stokTersedia < item.jumlah) {
            return { error: `Stok ${barang.namaBarang} tidak mencukupi. Tersedia: ${barang.stokTersedia}` };
        }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create Header
      const spb = await tx.spb.create({
        data: header,
      });

      // 2. Create Details
      for (const item of details) {
        await tx.spbDetail.create({
          data: {
            idSpb: spb.id,
            idBarang: item.idBarang,
            jumlah: item.jumlah,
          },
        });
      }
    });

    revalidatePath('/dashboard/spb');
    revalidatePath('/dashboard/spb-saya');
    return { success: true, message: 'Permintaan Barang berhasil dibuat' };

  } catch (error) {
    console.error('SPB Error:', error);
    return { error: 'Gagal menyimpan SPB' };
  }
}

export async function getSpbList({ page = 1, limit = 10, query = '' }) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { nomorSpb: { contains: query, mode: 'insensitive' } },
        { pemohon: { nama: { contains: query, mode: 'insensitive' } } },
      ],
    };
  
    try {
      const [data, total] = await Promise.all([
        prisma.spb.findMany({
          where,
          include: {
              pemohon: true,
              details: {
                  include: { barang: true }
              },
              sppbList: {
                  select: { id: true, nomorSppb: true }
              }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.spb.count({ where }),
      ]);
  
      // Flatten decimals if any (barang inside details has decimals)
      const safeData = data.map(item => ({
          ...item,
          hasSppb: item.sppbList.length > 0,
          sppbId: item.sppbList[0]?.id, // Assuming first one is the main one
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
    } catch (error) {
      console.error('Fetch Error:', error);
      return { error: 'Failed to fetch SPB' };
    }
}
