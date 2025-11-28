'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

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
  nomorReferensi: z.string().optional().default('-'), // or generated
  details: z.array(BastMasukDetailSchema).min(1, 'Minimal satu barang harus ditambahkan'),
});

export async function createBastMasuk(data) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  // Validate
  const validation = BastMasukSchema.safeParse({
    ...data,
    tanggalBast: new Date(data.tanggalBast),
    tanggalBapb: new Date(data.tanggalBapb),
  });

  if (!validation.success) {
    return { error: 'Validasi gagal', details: validation.error.flatten() };
  }

  const { details, ...header } = validation.data;

  try {
    // Transaction: Create Header -> Create Details -> Update Stock
    await prisma.$transaction(async (tx) => {
      // 1. Create Header
      const bast = await tx.bastMasuk.create({
        data: header,
      });

      // 2. Process Details
      for (const item of details) {
        // Create Detail Record
        await tx.bastMasukDetail.create({
          data: {
            idBastMasuk: bast.id,
            idBarang: item.idBarang,
            jumlah: item.jumlah,
            hargaSatuan: item.hargaSatuan,
            totalHarga: item.totalHarga,
          },
        });

        // 3. Update Stock & Price in Master Barang
        // Fetch current stock first
        const currentBarang = await tx.barang.findUnique({
            where: { id: item.idBarang }
        });

        if (currentBarang) {
            const newStock = currentBarang.stokTersedia + item.jumlah;
            
            // Optional: Update Master Price to latest price? 
            // Or Weighted Average? PRD doesn't specify.
            // Usually latest price is used for future reference, or kept static.
            // Let's update Master Price to the incoming price.
            
            await tx.barang.update({
                where: { id: item.idBarang },
                data: {
                    stokTersedia: newStock,
                    hargaSatuan: item.hargaSatuan, // Updating master price
                    totalHarga: newStock * item.hargaSatuan // Recalculate total valuation roughly
                }
            });
        }
      }
    });

    revalidatePath('/dashboard/bast-masuk');
    revalidatePath('/dashboard/barang'); // Refresh stock view
    return { success: true, message: 'BAST Masuk berhasil disimpan' };

  } catch (error) {
    console.error('Transaction Error:', error);
    return { error: 'Gagal menyimpan transaksi BAST Masuk' };
  }
}

export async function getBastMasukList({ page = 1, limit = 10, query = '' }) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };
  
    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { nomorBast: { contains: query, mode: 'insensitive' } },
        { pihakKetiga: { contains: query, mode: 'insensitive' } },
      ],
    };
  
    try {
      const [data, total] = await Promise.all([
        prisma.bastMasuk.findMany({
          where,
          include: {
              pptkPpk: true, // Include Pegawai name
              rekening: true,
              details: {
                  include: { barang: true }
              }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.bastMasuk.count({ where }),
      ]);
  
      // Serialize decimals
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
    } catch (error) {
      console.error('Fetch Error:', error);
      return { error: 'Failed to fetch BAST' };
    }
}
