'use server';

import { db } from '@/lib/db';
import { barang, kategori } from '@/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq, desc, and, like } from 'drizzle-orm';
import { getSession } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';

const createBarangSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  kategoriId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  satuanId: z.coerce.number().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z
    .string()
    .max(500, 'Spesifikasi maksimal 500 karakter')
    .optional(),
});

export async function createBarang(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createBarangSchema.parse(rawData);

    const session = await getSession();
    const userRole = (session?.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      throw new Error('Supervisor tidak dapat menambah barang');
    }

    let newKodeBarang = '';

    await db.transaction(async (tx) => {
      // Ambil prefix kategori
      const [kategoriData] = await tx
        .select({ prefix: kategori.prefix })
        .from(kategori)
        .where(eq(kategori.id, validatedData.kategoriId))
        .limit(1);

      if (!kategoriData) {
        throw new Error('Kategori tidak ditemukan');
      }

      const prefix = kategoriData.prefix;

      // Cari barang terakhir dengan prefix yang sama
      // Kita cari yang formatnya PREFIX.%
      const [latestBarang] = await tx
        .select({ kodeBarang: barang.kodeBarang })
        .from(barang)
        .where(like(barang.kodeBarang, `${prefix}.%`))
        .orderBy(desc(barang.id)) // Asumsi ID increment sejalan dengan waktu
        .limit(1);

      // Logic Generator Nomor
      let nextNumber = 1;
      if (latestBarang) {
        // Format: PRE.1234
        const parts = latestBarang.kodeBarang.split('.');
        if (parts.length >= 2) {
          const lastNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }

      // Format Kode Baru: PREFIX.0001
      newKodeBarang = `${prefix}.${nextNumber.toString().padStart(4, '0')}`;

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
    return {
      success: true,
      message: `Barang berhasil ditambahkan with kode ${newKodeBarang}`,
    };
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
    if (
      error.code === '23505' ||
      error.message?.includes('Unique constraint') ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('Failed query')
    ) {
      return {
        success: false,
        message:
          'Nama barang sudah ada (duplikat) atau Kode Barang bentrok. Silakan coba lagi.',
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
  nama: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(100, 'Nama maksimal 100 karakter'),
  stok: z.coerce
    .number()
    .min(0, 'Stok tidak boleh kurang dari 0')
    .max(1000000, 'Stok maksimal 1.000.000'),
  kategoriId: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  satuanId: z.coerce.number().min(1, 'Satuan wajib dipilih'),
  spesifikasi: z
    .string()
    .max(500, 'Spesifikasi maksimal 500 karakter')
    .optional(),
});

export async function updateBarang(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateBarangSchema.parse(rawData);

    const session = await getSession();
    const userRole = (session?.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      throw new Error('Supervisor tidak dapat mengubah data barang');
    }

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
    if (
      error.code === '23505' ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('unique constraint') ||
      error.message?.includes('Failed query')
    ) {
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
    const session = await getSession();
    const userRole = (session?.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      throw new Error('Supervisor tidak dapat menghapus barang');
    }

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
