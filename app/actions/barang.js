'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';

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

export async function getBarangList({ page = 1, limit = 10, query = '' }) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const skip = (page - 1) * limit;
  
  const where = {
    isActive: true,
    OR: [
      { namaBarang: { contains: query, mode: 'insensitive' } },
      { kodeBarang: { contains: query, mode: 'insensitive' } },
      { kategori: { contains: query, mode: 'insensitive' } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.barang.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.barang.count({ where }),
    ]);

    const safeData = data.map((item) => ({
      ...item,
      hargaSatuan: item.hargaSatuan.toNumber(),
      totalHarga: item.totalHarga.toNumber(),
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
    console.error('Failed to fetch barang:', error);
    return { error: 'Failed to fetch data' };
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

export async function createBarang(formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = BarangSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields', details: validated.error.flatten() };
  }

  const {
    namaBarang,
    kategori, // This will be the 'kode' (e.g. ELK) from the dropdown
    satuan,
    spesifikasi,
    asalPembelian,
    stokMinimum,
    hargaSatuan,
  } = validated.data;

  try {
    // 1. Fetch the category details to get the proper name if needed, or verify it exists
    // In our form we will send 'kode' as the value.
    // But we want to store the full Name in 'barang.kategori' field based on PRD common practice?
    // Wait, the schema just says "kategori String".
    // UIDD says "Kategori" is displayed. 
    // If we store "ELK", user sees "ELK". If we store "Elektronik", user sees "Elektronik".
    // Let's look up the Reference.
    const refKategori = await prisma.referensiKategori.findUnique({
      where: { kode: kategori },
    });
    
    if (!refKategori) {
        return { error: 'Kategori tidak valid' };
    }

    // 2. Generate Code: ELK-001
    const prefix = refKategori.kode; // ELK
    const lastItem = await prisma.barang.findFirst({
      where: {
        kodeBarang: { startsWith: prefix + '-' },
      },
      orderBy: {
        kodeBarang: 'desc',
      },
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

    // 3. Store Data
    // We store 'nama' (Elektronik) in the Kategori field for readability, 
    // OR we store the code?
    // If we store Name, we lose the link to the Code technically unless we lookup again.
    // But for reporting, Name is better. 
    // Let's store Name "Elektronik".
    const categoryNameToStore = refKategori.nama; 

    const totalHarga = 0; 

    await prisma.barang.create({
      data: {
        kodeBarang,
        namaBarang,
        kategori: categoryNameToStore, // Storing "Elektronik"
        satuan,
        spesifikasi,
        asalPembelian,
        stokMinimum,
        hargaSatuan,
        totalHarga,
        stokTersedia: 0,
      },
    });

    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Barang berhasil ditambahkan' };
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Gagal membuat barang' };
  }
}

export async function updateBarang(id, formData) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  const validated = BarangSchema.safeParse(formData);

  if (!validated.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const existingItem = await prisma.barang.findUnique({ where: { id } });
    if (!existingItem) return { error: 'Barang not found' };

    const totalHarga = existingItem.stokTersedia * validated.data.hargaSatuan;
    
    // Note: For update, we usually don't regenerate Kode Barang even if category changes
    // So we just update the other fields. 
    // If category changes, we update the 'kategori' name string?
    // For now, simple update.
    
    // If user changed Kategori dropdown, we receive a CODE (e.g. ELK).
    // But existing data might be "Elektronik".
    // We need to handle this if we want to allow category changes.
    // For MVP, let's assume Kategori update is allowed and we look it up again.
    
    let categoryToUpdate = validated.data.kategori;
    
    // Check if it looks like a code (short, uppercase) or just keep as is if it matches a ref
    const refKategori = await prisma.referensiKategori.findUnique({
         where: { kode: validated.data.kategori }
    });
    
    if (refKategori) {
        categoryToUpdate = refKategori.nama;
    } else {
        // Maybe they didn't change it and sent back "Elektronik"
        // Or maybe they sent an invalid code. 
        // If it matches existing Name, keep it.
    }

    await prisma.barang.update({
      where: { id },
      data: {
        ...validated.data,
        kategori: categoryToUpdate,
        totalHarga,
      },
    });

    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Barang berhasil diupdate' };
  } catch (error) {
    return { error: 'Gagal update barang' };
  }
}

export async function deleteBarang(id) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.barang.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Barang berhasil dihapus' };
  } catch (error) {
    return { error: 'Gagal menghapus barang' };
  }
}
