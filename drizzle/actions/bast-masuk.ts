'use server';

import { db } from '@/lib/db';
import {
  bastMasuk,
  bastMasukDetail,
  barang,
  mutasiBarang,
  pihakKetiga,
} from '@/drizzle/schema';
import {
  eq,
  desc,
  sql,
  inArray,
  count,
  or,
  and,
  ilike,
  gte,
  lte,
  exists,
  asc,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth'; // Adjust if needed
import { headers } from 'next/headers';
import { generateDocumentNumber } from '@/lib/document-numbering-utils';
import { Role } from '@/config/nav-items';

// Helper to check authentication
async function checkAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Zod Schema for Create/Update
import { createBastMasukSchema } from '@/lib/zod/bast-masuk';

// Helper to format date without timezone issues
function formatDateForDB(date: string | Date): string {
  if (typeof date === 'string') {
    // If already a string in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise parse it
    date = new Date(date);
  }

  // Format using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getBastMasuk() {
  await checkAuth();

  const data = await db.query.bastMasuk.findMany({
    with: {
      pihakKetiga: true,
      pptkPpk: true,
      asalPembelian: true,
    },
    orderBy: [desc(bastMasuk.createdAt)],
  });

  return { success: true, data };
}

export async function createBastMasuk(
  prevState: any,
  data: z.infer<typeof createBastMasukSchema>
) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      return {
        success: false,
        message: 'Supervisor tidak diizinkan membuat BAST Masuk',
      };
    }

    const validated = createBastMasukSchema.parse(data);

    // Format dates without timezone conversion
    const tglBast = formatDateForDB(validated.tanggalBast);
    const tglBapb = formatDateForDB(validated.tanggalBapb);

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any;

    while (attempt < maxRetries) {
      try {
        await db.transaction(async (tx) => {
          // Always generate a fresh number inside the retry loop
          const nomorRef = await generateDocumentNumber('bastMasuk');

          // 1. Create Header
          const [newBast] = await tx
            .insert(bastMasuk)
            .values({
              nomorReferensi: nomorRef,
              nomorBast: validated.nomorBast,
              tanggalBast: tglBast,
              nomorBapb: validated.nomorBapb,
              tanggalBapb: tglBapb,
              asalPembelianId: validated.asalPembelianId,
              kodeRekeningId: validated.rekeningId, // Use correct referenced column (kodeRekeningId) mapped from input (rekeningId)
              pihakKetigaId: validated.pihakKetigaId,
              pptkPpkId: validated.pptkPpkId,
              peruntukkan: validated.peruntukkan,
              keterangan: validated.keterangan,
            })
            .returning();

          // 2. Process Items
          for (const item of validated.items) {
            // Insert Detail
            await tx.insert(bastMasukDetail).values({
              bastMasukId: newBast.id,
              barangId: item.barangId,
              qty: item.qty,
              hargaSatuan: item.hargaSatuan.toString(),
              keterangan: item.keterangan,
            });

            const qtyTotal = item.qty;

            // Update Stock Barang
            // First get current stock to be safe
            const [currentItem] = await tx
              .select({ stok: barang.stok })
              .from(barang)
              .where(eq(barang.id, item.barangId));

            const newStock = (currentItem?.stok || 0) + qtyTotal;

            await tx
              .update(barang)
              .set({ stok: newStock })
              .where(eq(barang.id, item.barangId));

            // Create Mutation Record
            await tx.insert(mutasiBarang).values({
              barangId: item.barangId,
              tanggal: new Date(),
              jenisMutasi: 'MASUK',
              qtyMasuk: qtyTotal,
              qtyKeluar: 0,
              stokAkhir: newStock,
              referensiId: newBast.nomorBast,
              sumberTransaksi: 'BAST_MASUK',
              keterangan: `Penerimaan Barang via BAST ${newBast.nomorBast}`,
            });
          }
        });

        // If transaction succeeds, break the loop
        revalidatePath('/dashboard/bast-masuk');
        return { success: true, message: 'BAST Masuk berhasil disimpan' };
      } catch (error: any) {
        lastError = error;
        const pgError = error.cause || error;
        // Check for unique constraint on nomor_referensi
        if (
          (pgError.code === '23505' ||
            error.message?.includes('unique constraint')) &&
          (pgError.constraint_name?.includes('nomor_referensi') ||
            error.message?.includes('nomor_referensi'))
        ) {
          console.warn(
            `Unique constraint collision on nomor_referensi, retrying... (Attempt ${attempt + 1}/${maxRetries})`
          );
          attempt++;
          // Wait a bit before retrying to reduce contention
          await new Promise((res) => setTimeout(res, 100));
          continue;
        }

        // If it's another error, throw immediately
        throw error;
      }
    }

    // If we exhausted retries
    throw lastError;
  } catch (error: any) {
    console.error('Create BAST Error:', error);

    // PostgreSQL error might be in error.cause
    const pgError = error.cause || error;
    const errorMessage = error.message || '';

    // Handle unique constraint violations (PostgreSQL error code 23505)
    if (
      pgError.code === '23505' ||
      errorMessage.includes('unique constraint')
    ) {
      const constraintName =
        pgError.constraint_name || pgError.constraint || '';

      if (
        constraintName.includes('nomor_referensi') ||
        errorMessage.includes('nomor_referensi')
      ) {
        return {
          success: false,
          message:
            'Gagal membuat Nomor Referensi unik setelah beberapa percobaan. Silakan coba lagi.',
        };
      }
      if (
        constraintName.includes('nomor_bast') ||
        errorMessage.includes('nomor_bast')
      ) {
        return { success: false, message: 'Nomor BAST sudah terdaftar' };
      }
      if (
        constraintName.includes('nomor_bapb') ||
        errorMessage.includes('nomor_bapb')
      ) {
        return { success: false, message: 'Nomor BAPB sudah ada dalam sistem' };
      }

      return {
        success: false,
        message: 'Data yang Anda masukkan sudah ada dalam sistem',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal menyimpan BAST Masuk',
    };
  }
}

export async function updateBastMasuk(
  id: number,
  prevState: any,
  data: z.infer<typeof createBastMasukSchema>
) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      return {
        success: false,
        message: 'Supervisor tidak diizinkan mengubah BAST Masuk',
      };
    }

    const validated = createBastMasukSchema.parse(data);

    // Format dates without timezone conversion
    const tglBast = formatDateForDB(validated.tanggalBast);
    const tglBapb = formatDateForDB(validated.tanggalBapb);

    await db.transaction(async (tx) => {
      const oldDetails = await tx.query.bastMasukDetail.findMany({
        where: eq(bastMasukDetail.bastMasukId, id),
      });

      const oldBast = await tx.query.bastMasuk.findFirst({
        where: eq(bastMasuk.id, id),
      });

      if (!oldBast) throw new Error('Data BAST tidak ditemukan');

      for (const item of oldDetails) {
        const [currentBarang] = await tx
          .select({ stok: barang.stok, nama: barang.nama })
          .from(barang)
          .where(eq(barang.id, item.barangId));

        const revertedStock = (currentBarang?.stok || 0) - item.qty;

        if (revertedStock < 0) {
          throw new Error(
            `Gagal Edit! Barang "${currentBarang?.nama || 'Unknown'}" sudah terpakai. Stok saat ini (${currentBarang?.stok}) tidak cukup untuk membatalkan transaksi ini.`
          );
        }

        await tx
          .update(barang)
          .set({ stok: revertedStock })
          .where(eq(barang.id, item.barangId));

        // Record reversal mutation
        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          tanggal: new Date(),
          jenisMutasi: 'PENYESUAIAN',
          qtyMasuk: 0,
          qtyKeluar: item.qty,
          stokAkhir: revertedStock,
          referensiId: oldBast.nomorBast,
          sumberTransaksi: 'EDIT_BAST_MASUK',
          keterangan: `Revisi BAST (Revert) ${oldBast.nomorBast}`,
        });
      }

      // 2. Delete Old Details
      await tx
        .delete(bastMasukDetail)
        .where(eq(bastMasukDetail.bastMasukId, id));

      // 3. Update Header
      await tx
        .update(bastMasuk)
        .set({
          nomorReferensi: validated.nomorReferensi,
          nomorBast: validated.nomorBast,
          tanggalBast: tglBast,
          nomorBapb: validated.nomorBapb,
          tanggalBapb: tglBapb,
          asalPembelianId: validated.asalPembelianId,
          kodeRekeningId: validated.rekeningId,
          pihakKetigaId: validated.pihakKetigaId,
          pptkPpkId: validated.pptkPpkId,
          peruntukkan: validated.peruntukkan,
          keterangan: validated.keterangan,
          updatedAt: new Date(),
        })
        .where(eq(bastMasuk.id, id));

      // 4. Insert New Details & Update Stock
      for (const item of validated.items) {
        // Insert Detail
        await tx.insert(bastMasukDetail).values({
          bastMasukId: id,
          barangId: item.barangId,
          qty: item.qty,
          hargaSatuan: item.hargaSatuan.toString(),
          keterangan: item.keterangan,
        });

        const qtyTotal = item.qty;

        // Update Stock
        const [currentBarang] = await tx
          .select({ stok: barang.stok })
          .from(barang)
          .where(eq(barang.id, item.barangId));

        const newStock = (currentBarang?.stok || 0) + qtyTotal;

        await tx
          .update(barang)
          .set({ stok: newStock })
          .where(eq(barang.id, item.barangId));

        // Create Mutation Record
        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          tanggal: new Date(),
          jenisMutasi: 'MASUK',
          qtyMasuk: qtyTotal,
          qtyKeluar: 0,
          stokAkhir: newStock,
          referensiId: validated.nomorBast,
          sumberTransaksi: 'EDIT_BAST_MASUK',
          keterangan: `Revisi BAST (Update) ${validated.nomorBast}`,
        });
      }
    });

    revalidatePath('/dashboard/bast-masuk');
    return { success: true, message: 'BAST Masuk berhasil diperbarui' };
  } catch (error: any) {
    console.error('Update BAST Error:', error);

    // PostgreSQL error might be in error.cause
    const pgError = error.cause || error;
    const errorMessage = error.message || '';

    // Handle unique constraint violations (PostgreSQL error code 23505)
    if (
      pgError.code === '23505' ||
      errorMessage.includes('unique constraint')
    ) {
      const constraintName =
        pgError.constraint_name || pgError.constraint || '';

      if (
        constraintName.includes('nomor_referensi') ||
        errorMessage.includes('nomor_referensi')
      ) {
        return { success: false, message: 'Nomor Referensi sudah digunakan' };
      }
      if (
        constraintName.includes('nomor_bast') ||
        errorMessage.includes('nomor_bast')
      ) {
        return { success: false, message: 'Nomor BAST sudah terdaftar' };
      }
      if (
        constraintName.includes('nomor_bapb') ||
        errorMessage.includes('nomor_bapb')
      ) {
        return { success: false, message: 'Nomor BAPB sudah ada dalam sistem' };
      }

      return {
        success: false,
        message: 'Data yang Anda masukkan sudah ada dalam sistem',
      };
    }

    return {
      success: false,
      message: error.message || 'Gagal memperbarui BAST Masuk',
    };
  }
}

export async function deleteBastMasuk(id: number) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      return {
        success: false,
        message: 'Supervisor tidak diizinkan menghapus BAST Masuk',
      };
    }

    await db.transaction(async (tx) => {
      // 1. Get existing details to reverse stock
      const details = await tx.query.bastMasukDetail.findMany({
        where: eq(bastMasukDetail.bastMasukId, id),
      });

      const bastion = await tx.query.bastMasuk.findFirst({
        where: eq(bastMasuk.id, id),
      });

      if (!bastion) throw new Error('BAST tidak ditemukan');

      for (const item of details) {
        // Reverse Stock
        const [currentBarang] = await tx
          .select({ stok: barang.stok, nama: barang.nama })
          .from(barang)
          .where(eq(barang.id, item.barangId));

        const newStock = (currentBarang?.stok || 0) - item.qty;

        if (newStock < 0) {
          throw new Error(
            `Gagal! Barang "${currentBarang?.nama || 'Unknown'}" sudah terpakai. Stok saat ini (${currentBarang?.stok}) tidak cukup untuk membatalkan transaksi ini (Butuh: ${item.qty}).`
          );
        }

        await tx
          .update(barang)
          .set({ stok: newStock })
          .where(eq(barang.id, item.barangId));

        // Create Mutation Record (Reversal)
        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          tanggal: new Date(),
          jenisMutasi: 'PENYESUAIAN',
          qtyMasuk: 0,
          qtyKeluar: item.qty, // Treated as reducing stock
          stokAkhir: newStock,
          referensiId: bastion.nomorBast,
          sumberTransaksi: 'PEMBATALAN_BAST_MASUK',
          keterangan: `Pembatalan BAST ${bastion.nomorBast}`,
        });
      }

      // 2. Delete Header (Cascade deletes details)
      await tx.delete(bastMasuk).where(eq(bastMasuk.id, id));
    });

    revalidatePath('/dashboard/bast-masuk');
    return { success: true, message: 'BAST Masuk berhasil dihapus' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal menghapus data',
    };
  }
}

// --- DATA FETCHING (Previously in drizzle/data/bast-masuk.ts) ---

export async function getBastMasukStats() {
  // Total BAST
  const [totalResult] = await db.select({ count: count() }).from(bastMasuk);
  const totalBast = totalResult?.count ?? 0;

  // Total Nilai Transaksi
  const [nilaiResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bastMasukDetail.qty} * ${bastMasukDetail.hargaSatuan}), 0)`,
    })
    .from(bastMasukDetail);
  const totalNilaiTransaksi = Number(nilaiResult?.total ?? 0);

  // Supplier Terbanyak
  const topSupplierResult = await db
    .select({
      supplierNama: pihakKetiga.nama,
      count: count(bastMasuk.id),
    })
    .from(bastMasuk)
    .leftJoin(pihakKetiga, eq(bastMasuk.pihakKetigaId, pihakKetiga.id))
    .groupBy(pihakKetiga.nama)
    .orderBy(desc(count(bastMasuk.id)))
    .limit(1);

  const supplierTerbanyak = topSupplierResult[0]
    ? `${topSupplierResult[0].supplierNama} (${topSupplierResult[0].count})`
    : '-';

  return {
    totalBast,
    totalNilaiTransaksi,
    supplierTerbanyak,
  };
}

export async function getBastMasukList(
  page: number = 1,
  limit: number = 50,
  search?: string,
  sortBy: string = 'nomorReferensi',
  sortOrder: 'asc' | 'desc' = 'desc',
  // Filters
  pihakKetigaId?: number,
  pptkPpkId?: number,
  asalPembelianId?: number,
  kodeRekeningId?: number,
  startDate?: Date,
  endDate?: Date
) {
  const offset = (page - 1) * limit;

  const baseFilters = [];
  let searchFilterCount = undefined;
  let searchFilterData = undefined;

  // Search filter
  if (search) {
    searchFilterCount = or(
      ilike(bastMasuk.nomorBast, `%${search}%`),
      ilike(bastMasuk.nomorReferensi, `%${search}%`),
      ilike(bastMasuk.nomorBapb, `%${search}%`),
      exists(
        db
          .select()
          .from(pihakKetiga)
          .where(
            and(
              eq(pihakKetiga.id, bastMasuk.pihakKetigaId),
              ilike(pihakKetiga.nama, `%${search}%`)
            )
          )
      )
    );

    searchFilterData = or(
      ilike(bastMasuk.nomorBast, `%${search}%`),
      ilike(bastMasuk.nomorReferensi, `%${search}%`),
      ilike(bastMasuk.nomorBapb, `%${search}%`),
      exists(
        db
          .select()
          .from(pihakKetiga)
          .where(
            and(
              eq(pihakKetiga.id, sql.raw('"bastMasuk"."pihak_ketiga_id"')),
              ilike(pihakKetiga.nama, `%${search}%`)
            )
          )
      )
    );
  }

  // Date range filter
  if (startDate) {
    baseFilters.push(
      gte(bastMasuk.tanggalBast, startDate.toISOString().split('T')[0])
    );
  }
  if (endDate) {
    baseFilters.push(
      lte(bastMasuk.tanggalBast, endDate.toISOString().split('T')[0])
    );
  }

  // ID filters
  if (pihakKetigaId) {
    baseFilters.push(eq(bastMasuk.pihakKetigaId, pihakKetigaId));
  }
  if (pptkPpkId) {
    baseFilters.push(eq(bastMasuk.pptkPpkId, pptkPpkId));
  }
  if (asalPembelianId) {
    baseFilters.push(eq(bastMasuk.asalPembelianId, asalPembelianId));
  }
  if (kodeRekeningId) {
    baseFilters.push(eq(bastMasuk.kodeRekeningId, kodeRekeningId));
  }

  const whereClauseCount =
    baseFilters.length > 0 || searchFilterCount
      ? and(...baseFilters, ...(searchFilterCount ? [searchFilterCount] : []))
      : undefined;

  const whereClauseData =
    baseFilters.length > 0 || searchFilterData
      ? and(...baseFilters, ...(searchFilterData ? [searchFilterData] : []))
      : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(bastMasuk)
    .where(whereClauseCount);

  const total = totalResult?.count ?? 0;
  const pageCount = Math.ceil(total / limit);

  // Get paginated data
  const data = await db.query.bastMasuk.findMany({
    where: whereClauseData,
    with: {
      pihakKetiga: true,
      pptkPpk: true,
      asalPembelian: true,
      kodeRekening: true,
    },
    orderBy:
      sortBy === 'nomorBast'
        ? sortOrder === 'asc'
          ? asc(bastMasuk.nomorBast)
          : desc(bastMasuk.nomorBast)
        : sortBy === 'nomorReferensi'
          ? sortOrder === 'asc'
            ? asc(bastMasuk.nomorReferensi)
            : desc(bastMasuk.nomorReferensi)
          : sortBy === 'tanggalBast'
            ? sortOrder === 'asc'
              ? asc(bastMasuk.tanggalBast)
              : desc(bastMasuk.tanggalBast)
            : sortOrder === 'asc'
              ? asc(bastMasuk.createdAt)
              : desc(bastMasuk.createdAt),
    limit,
    offset,
  });

  return {
    data,
    meta: {
      total,
      pageCount,
      page,
      limit,
    },
  };
}

export async function getBastMasukById(id: number) {
  await checkAuth();

  const data = await db.query.bastMasuk.findFirst({
    where: eq(bastMasuk.id, id),
    with: {
      items: {
        with: {
          barang: {
            with: {
              satuan: true,
            },
          },
        },
      },
      pihakKetiga: true,
      pptkPpk: true,
      asalPembelian: true,
      kodeRekening: true, // Use the correct relation name 'kodeRekening' instead of 'rekening'
    },
  });

  if (!data) return { success: false, message: 'Data not found' };

  return { success: true, data };
}
