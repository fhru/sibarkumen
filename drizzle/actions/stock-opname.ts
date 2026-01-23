'use server';

// import { db } from '@/drizzle/db';
import { db } from '@/lib/db';
import {
  stockOpname,
  stockOpnameDetail,
  barang,
  pegawai,
  mutasiBarang,
} from '@/drizzle/schema';
import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-utils';
import { Role } from '@/config/nav-items';
import { z } from 'zod';

// Zod Schema for Stock Opname Item Update
import { stockOpnameItemSchema } from '@/lib/zod/stock-opname';

// Helper to generate Stock Opname Number
async function generateNomorStockOpname() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  // Format: SO/YYYY/MM/XXXX
  const prefix = `SO/${year}/${month}/`;

  // Get last number
  const lastRecord = await db.query.stockOpname.findFirst({
    where: (table, { like }) => like(table.nomor, `${prefix}%`),
    orderBy: (table, { desc }) => [desc(table.id)],
  });

  let nextNumber = 1;
  if (lastRecord) {
    const parts = lastRecord.nomor.split('/');
    const lastSeq = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

export async function createStockOpnameSession(
  petugasId: number,
  keterangan?: string
) {
  try {
    const session = await getSession();
    const userRole = (session?.user.role as Role) || 'petugas';

    if (userRole === 'supervisor') {
      return {
        success: false,
        error: 'Supervisor tidak dapat membuat Stock Opname',
      };
    }

    const nomor = await generateNomorStockOpname();

    // 1. Create Header
    const [tHeader] = await db
      .insert(stockOpname)
      .values({
        nomor,
        tanggal: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: 'DRAFT',
        petugasId,
        keterangan,
      })
      .returning();

    // 2. Snapshot current stock for all items
    const allItems = await db.select().from(barang);

    if (allItems.length > 0) {
      const details = allItems.map((item) => ({
        stockOpnameId: tHeader.id,
        barangId: item.id,
        stokSistem: item.stok,
        stokFisik: item.stok, // Default to system stock
        selisih: 0,
      }));

      await db.insert(stockOpnameDetail).values(details);
    }

    revalidatePath('/dashboard/stock-opname');
    return { success: true, data: tHeader };
  } catch (error) {
    console.error('Error creating stock opname session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function updateStockOpnameItem(
  detailId: number,
  stokFisik: number,
  keterangan?: string
) {
  try {
    // Validate input
    const validated = stockOpnameItemSchema.parse({ stokFisik, keterangan });

    // Get the detail first to calculate selisih
    const item = await db.query.stockOpnameDetail.findFirst({
      where: eq(stockOpnameDetail.id, detailId),
    });

    if (!item) return { success: false, error: 'Item not found' };

    const selisih = validated.stokFisik - item.stokSistem;

    await db
      .update(stockOpnameDetail)
      .set({
        stokFisik: validated.stokFisik,
        selisih,
        keterangan: validated.keterangan,
      })
      .where(eq(stockOpnameDetail.id, detailId));

    revalidatePath(`/dashboard/stock-opname/${item.stockOpnameId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating stock opname item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function finalizeStockOpname(stockOpnameId: number) {
  return await db.transaction(async (tx) => {
    try {
      const authSession = await getSession(); // Variable name change to avoid conflict with 'session' used below
      const userRole = (authSession?.user.role as Role) || 'petugas';

      if (userRole === 'supervisor') {
        throw new Error(
          'Supervisor tidak dapat melakukan finalisasi Stock Opname'
        );
      }

      const session = await tx.query.stockOpname.findFirst({
        where: eq(stockOpname.id, stockOpnameId),
        with: {
          items: true,
        },
      });

      if (!session) throw new Error('Session not found');
      if (session.status !== 'DRAFT')
        throw new Error('Session is not in DRAFT status');

      // Filter items with selisih != 0
      const itemsToAdjust = session.items.filter((item) => item.selisih !== 0);

      const now = new Date();

      for (const item of itemsToAdjust) {
        // Create Mutation Record
        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          tanggal: now,
          jenisMutasi: 'PENYESUAIAN',
          qtyMasuk: item.selisih > 0 ? item.selisih : 0,
          qtyKeluar: item.selisih < 0 ? Math.abs(item.selisih) : 0,
          stokAkhir: item.stokFisik, // The physical stock becomes the new final stock
          referensiId: session.nomor,
          sumberTransaksi: 'STOCK_OPNAME',
          keterangan: `Penyesuaian Stock Opname: ${item.keterangan || '-'}`,
        });

        // Update Barang Stock
        await tx
          .update(barang)
          .set({ stok: item.stokFisik })
          .where(eq(barang.id, item.barangId));
      }

      // Update Header Status
      await tx
        .update(stockOpname)
        .set({ status: 'COMPLETED' })
        .where(eq(stockOpname.id, stockOpnameId));

      revalidatePath('/dashboard/stock-opname');
      return { success: true };
    } catch (error: any) {
      console.error('Error finalizing stock opname:', error);
      return { success: false, error: error.message || 'Failed to finalize' };
    }
  });
}

export async function fetchStockOpnameSessions(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status?: string,
  petugasId?: number
) {
  try {
    const filters = [];

    if (search) {
      filters.push(sql`${stockOpname.nomor} ILIKE ${`%${search}%`}`);
    }

    if (status) {
      filters.push(eq(stockOpname.status, status as any));
    }

    if (petugasId) {
      filters.push(eq(stockOpname.petugasId, petugasId));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [totalData] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stockOpname)
      .where(whereClause);

    const total = Number(totalData.count);
    const pageCount = Math.ceil(total / limit);

    const data = await db.query.stockOpname.findMany({
      where: whereClause,
      with: {
        petugas: true,
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: limit,
      offset: (page - 1) * limit,
    });

    return { success: true, data, meta: { pageCount, total } };
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return { success: false, data: [], meta: { pageCount: 0, total: 0 } };
  }
}

export async function fetchStockOpnameById(id: number) {
  try {
    const data = await db.query.stockOpname.findFirst({
      where: eq(stockOpname.id, id),
      with: {
        petugas: true,
        items: {
          with: {
            barang: {
              with: {
                satuan: true,
              },
            },
          },
          orderBy: (table, { asc }) => [asc(table.barangId)], // Order by Barang ID or Name if available, or just ID
        },
      },
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching session by id:', error);
    return { success: false, data: null };
  }
}

export async function fetchPegawaiList(query: string = '') {
  try {
    const whereClause = query
      ? sql`${pegawai.nama} ILIKE ${`%${query}%`}`
      : undefined;

    const data = await db.query.pegawai.findMany({
      where: whereClause,
      orderBy: (table, { asc }) => [asc(table.nama)],
      limit: 20, // Limit results for async select
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching pegawai list:', error);
    return { success: false, data: [] };
  }
}
