'use server';

import { db } from '@/lib/db';
import { barang, kategori } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq, desc, and, like } from 'drizzle-orm';
import { getCategoryPrefix } from '@/lib/string-utils';

const createBarangSchema = z.object({
  nama: z.string().min(1, 'Nama barang wajib diisi'),
  kategoriId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  satuanId: z.coerce.number().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z.string().optional(),
});

export async function createBarang(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createBarangSchema.parse(rawData);

    await db.transaction(async (tx) => {
      // Ambil nama kategori untuk Prefix
      const [kategoriData] = await tx
        .select({ nama: kategori.nama })
        .from(kategori)
        .where(eq(kategori.id, validatedData.kategoriId))
        .limit(1);

      if (!kategoriData) {
        throw new Error('Kategori tidak ditemukan');
      }

      const prefix = getCategoryPrefix(kategoriData.nama);

      // Cari barang terakhir (Sorting berdasarkan ID desc untuk dapat yang terbaru)
      const [latestBarang] = await tx
        .select({ kodeBarang: barang.kodeBarang })
        .from(barang)
        .where(like(barang.kodeBarang, `${prefix}-%`))
        .orderBy(desc(barang.id))
        .limit(1);

      // Logic Generator Nomor
      let nextNumber = 1;
      if (latestBarang) {
        const parts = latestBarang.kodeBarang.split('-');
        if (parts.length >= 2) {
          const lastNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }

      // Format Kode Baru
      const newKodeBarang = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;

      // Insert ke Database
      await tx.insert(barang).values({
        nama: validatedData.nama,
        kodeBarang: newKodeBarang,
        stok: 0,
        kategoriId: validatedData.kategoriId,
        satuanId: validatedData.satuanId,
        spesifikasi: validatedData.spesifikasi || null,
      });
    });

    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Barang berhasil ditambahkan' };
  } catch (error: any) {
    console.error('Failed to create barang:', error);

    // Handle Zod Error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validasi gagal',
        errors: error.flatten().fieldErrors,
      };
    }

    // Handle Error Database (Misal Kode Unik Duplicate)
    // Code 'P2002' adalah kode error umum Prisma/DB untuk Unique Constraint,
    // sesuaikan jika pakai driver Postgres native (23505).
    if (error.message.includes('Unique constraint') || error.code === '23505') {
      return {
        success: false,
        message: 'Gagal generate kode unik. Silakan coba lagi.',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menambahkan barang.',
    };
  }
}

const updateBarangSchema = z.object({
  id: z.coerce.number(),
  nama: z.string().min(1, 'Nama barang wajib diisi'),
  stok: z.coerce.number().min(0, 'Stok tidak boleh kurang dari 0'),
  kategoriId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  satuanId: z.coerce.number().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z.string().optional(),
});

export async function updateBarang(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateBarangSchema.parse(rawData);

    await db
      .update(barang)
      .set({
        nama: validatedData.nama,
        stok: validatedData.stok,
        kategoriId: validatedData.kategoriId,
        satuanId: validatedData.satuanId,
        spesifikasi: validatedData.spesifikasi || null,
        updatedAt: new Date(),
      })
      .where(eq(barang.id, validatedData.id));

    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Barang berhasil diperbarui' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Gagal validasi data',
        errors: error.flatten().fieldErrors,
      };
    }
    if (error.code === '23505') {
      return {
        success: false,
        message: 'Nama barang sudah ada (duplikat)',
      };
    }
    return {
      success: false,
      message: 'Gagal memperbarui barang: ' + error.message,
    };
  }
}

export async function deleteBarang(id: number) {
  try {
    await db.delete(barang).where(eq(barang.id, id));
    revalidatePath('/dashboard/barang');
    return { success: true, message: 'Barang berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghapus barang: ' + error.message,
    };
  }
}
