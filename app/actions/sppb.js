'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { generateDocumentNumber } from '@/lib/number-generator';

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

export async function createSppb(data) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validation = SppbSchema.safeParse({
    ...data,
    tanggalSppb: new Date(data.tanggalSppb),
  });

  if (!validation.success) {
    return { error: 'Validasi gagal', details: validation.error.flatten() };
  }

  const { details, ...header } = validation.data;

  try {
    // Auto-generate number if empty
    if (!header.nomorSppb) {
        header.nomorSppb = await generateDocumentNumber('SPPB', 'sppb', 'tanggalSppb');
    }

    // Transaction: Create SPPB -> Details -> Deduct Stock
    await prisma.$transaction(async (tx) => {
      // Check if SPB is already processed? Optional check.
      // 1. Create Header
      const sppb = await tx.sppb.create({
        data: header,
      });

      // 2. Process Details & Stock
      for (const item of details) {
        await tx.sppbDetail.create({
          data: {
            idSppb: sppb.id,
            idBarang: item.idBarang,
            jumlahDisalurkan: item.jumlahDisalurkan,
          },
        });

        // Deduct Stock
        const barang = await tx.barang.findUnique({ where: { id: item.idBarang } });
        if (barang) {
            if (barang.stokTersedia < item.jumlahDisalurkan) {
                throw new Error(`Stok tidak cukup untuk ${barang.namaBarang}. Sisa: ${barang.stokTersedia}`);
            }
            await tx.barang.update({
                where: { id: item.idBarang },
                data: {
                    stokTersedia: barang.stokTersedia - item.jumlahDisalurkan
                }
            });
        }
      }
    });

    revalidatePath('/dashboard/sppb');
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'SPPB Berhasil Dibuat' };

  } catch (error) {
    console.error(error);
    return { error: error.message || 'Gagal membuat SPPB' };
  }
}

export async function getSppbList({ page = 1, limit = 10, query = '' }) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { nomorSppb: { contains: query, mode: 'insensitive' } },
        { spb: { nomorSpb: { contains: query, mode: 'insensitive' } } },
      ],
    };
  
    try {
      const [data, total] = await Promise.all([
        prisma.sppb.findMany({
          where,
          include: {
              spb: true,
              penerima: true,
              details: { include: { barang: true } },
              bastKeluarList: {
                  select: { id: true, nomorBast: true }
              }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.sppb.count({ where }),
      ]);
  
      // Sanitize decimals
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
    } catch (error) {
      return { error: 'Failed to fetch SPPB' };
    }
}

// Helper to get available SPBs
export async function getSpbOptions() {
    // Ideally filter out those fully processed, but for now list all
    try {
        const spbs = await prisma.spb.findMany({
            where: {
                sppbList: { none: {} } // Only fetch SPB that has NO SPPB
            },
            orderBy: { createdAt: 'desc' },
            include: {
                pemohon: true,
                details: { include: { barang: true } }
            },
            take: 50 // limit for dropdown
        });
        
        // Serialize decimals in nested barang
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
    } catch(e) {
        return [];
    }
}
