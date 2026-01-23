'use server';

import { db } from '@/lib/db';
import {
  sppb,
  sppbDetail,
  barang,
  mutasiBarang,
  spb,
  spbDetail,
} from '@/drizzle/schema';
import {
  eq,
  inArray,
  count,
  desc,
  sql,
  and,
  gte,
  lte,
  asc,
  or,
  like,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { generateSPPBNumber } from './generate-number';

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

// Zod Schemas
import { createSPPBSchema, completeSPPBSchema } from '@/lib/zod/sppb';

// Helper to format date
function formatDateForDB(date: string | Date): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function createSPPBFromSPB(
  prevState: any,
  data: z.infer<typeof createSPPBSchema>
) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as any) || 'petugas';

    if (userRole === 'supervisor' || userRole === 'petugas') {
      throw new Error('Anda tidak memiliki akses untuk membuat SPPB');
    }

    const validated = createSPPBSchema.parse(data);

    // 1. Verify SPB exists and is approved
    const spbData = await db.query.spb.findFirst({
      where: eq(spb.id, validated.spbId),
      with: {
        items: true,
      },
    });

    if (!spbData) {
      return { success: false, message: 'SPB tidak ditemukan' };
    }

    const tglSppb = formatDateForDB(validated.tanggalSppb);

    await db.transaction(async (tx) => {
      // 2. Generate SPPB number
      const nomorSppb = await generateSPPBNumber();

      // 3. Create SPPB Header
      const [newSppb] = await tx
        .insert(sppb)
        .values({
          nomorSppb,
          tanggalSppb: tglSppb,
          spbId: validated.spbId,
          pejabatPenyetujuId: validated.pejabatPenyetujuId,
          diterimaOlehId: spbData.pemohonId, // Auto-assign to SPB requester
          keterangan: validated.keterangan,
          status: 'MENUNGGU_BAST',
        })
        .returning();

      // 4. Create SPPB Details
      for (const item of validated.items) {
        await tx.insert(sppbDetail).values({
          sppbId: newSppb.id,
          barangId: item.barangId,
          qtyDisetujui: item.qtyDisetujui,
          keterangan: item.keterangan,
        });
      }

      // 5. Update SPB status to SELESAI (Completed)
      await tx
        .update(spb)
        .set({
          status: 'SELESAI',
          updatedAt: new Date(),
        })
        .where(eq(spb.id, validated.spbId));
    });

    revalidatePath('/dashboard/sppb');
    revalidatePath(`/dashboard/spb/${validated.spbId}`);
    return { success: true, message: 'SPPB berhasil dibuat' };
  } catch (error: any) {
    console.error('Error creating SPPB:', error);
    return {
      success: false,
      message: error.message || 'Gagal membuat SPPB',
    };
  }
}

export async function updateSPPB(
  id: number,
  prevState: any,
  data: z.infer<typeof createSPPBSchema>
) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as any) || 'petugas';

    if (userRole === 'supervisor' || userRole === 'petugas') {
      throw new Error('Anda tidak memiliki akses untuk mengupdate SPPB');
    }

    const validated = createSPPBSchema.parse(data);

    // Check if SPPB exists and not completed
    const existingSppb = await db.query.sppb.findFirst({
      where: eq(sppb.id, id),
    });

    if (!existingSppb) {
      return { success: false, message: 'SPPB tidak ditemukan' };
    }

    if (existingSppb.serahTerimaOlehId) {
      return {
        success: false,
        message: 'SPPB sudah diselesaikan, tidak bisa diubah',
      };
    }

    const tglSppb = formatDateForDB(validated.tanggalSppb);

    await db.transaction(async (tx) => {
      // 1. Update SPPB Header
      await tx
        .update(sppb)
        .set({
          tanggalSppb: tglSppb,
          pejabatPenyetujuId: validated.pejabatPenyetujuId,
          // diterimaOlehId: validated.diterimaOlehId, // Removed from update input
          keterangan: validated.keterangan,
        })
        .where(eq(sppb.id, id));

      // 2. Delete existing details
      await tx.delete(sppbDetail).where(eq(sppbDetail.sppbId, id));

      // 3. Create new details
      for (const item of validated.items) {
        await tx.insert(sppbDetail).values({
          sppbId: id,
          barangId: item.barangId,
          qtyDisetujui: item.qtyDisetujui,
          keterangan: item.keterangan,
        });
      }
    });

    revalidatePath('/dashboard/sppb');
    revalidatePath(`/dashboard/sppb/${id}`);
    return { success: true, message: 'SPPB berhasil diperbarui' };
  } catch (error: any) {
    console.error('Error updating SPPB:', error);
    return {
      success: false,
      message: error.message || 'Gagal memperbarui SPPB',
    };
  }
}

export async function deleteSPPB(id: number) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as any) || 'petugas';

    if (userRole === 'supervisor' || userRole === 'petugas') {
      throw new Error('Anda tidak memiliki akses untuk menghapus SPPB');
    }

    // Check if SPPB exists and not completed
    const existingSppb = await db.query.sppb.findFirst({
      where: eq(sppb.id, id),
    });

    if (!existingSppb) {
      return { success: false, message: 'SPPB tidak ditemukan' };
    }

    if (existingSppb.serahTerimaOlehId) {
      return {
        success: false,
        message: 'SPPB sudah diselesaikan, tidak bisa dihapus',
      };
    }

    await db.delete(sppb).where(eq(sppb.id, id));

    revalidatePath('/dashboard/sppb');
    return { success: true, message: 'SPPB berhasil dihapus' };
  } catch (error: any) {
    console.error('Error deleting SPPB:', error);
    return {
      success: false,
      message: error.message || 'Gagal menghapus SPPB',
    };
  }
}

export async function completeSPPB(
  id: number,
  prevState: any,
  data: z.infer<typeof completeSPPBSchema>
) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as any) || 'petugas';

    if (userRole === 'supervisor' || userRole === 'petugas') {
      throw new Error('Anda tidak memiliki akses untuk menyelesaikan SPPB');
    }

    const validated = completeSPPBSchema.parse(data);

    // Get SPPB with items
    const sppbData = await db.query.sppb.findFirst({
      where: eq(sppb.id, id),
      with: {
        items: {
          with: {
            barang: true,
          },
        },
      },
    });

    if (!sppbData) {
      return { success: false, message: 'SPPB tidak ditemukan' };
    }

    if (sppbData.serahTerimaOlehId) {
      return { success: false, message: 'SPPB sudah diselesaikan' };
    }

    await db.transaction(async (tx) => {
      // 1. Update SPPB - set serah terima
      await tx
        .update(sppb)
        .set({
          serahTerimaOlehId: validated.serahTerimaOlehId,
          status: 'MENUNGGU_BAST', // Goods released, waiting for BAST
        })
        .where(eq(sppb.id, id));

      // 3. Deduct stock and create mutasi for each item
      for (const item of sppbData.items) {
        // Deduct stock
        await tx
          .update(barang)
          .set({
            stok: item.barang.stok - item.qtyDisetujui,
          })
          .where(eq(barang.id, item.barangId));

        // Create mutasi record
        const currentStock = item.barang.stok - item.qtyDisetujui;
        await tx.insert(mutasiBarang).values({
          barangId: item.barangId,
          jenisMutasi: 'KELUAR',
          qtyMasuk: 0,
          qtyKeluar: item.qtyDisetujui,
          stokAkhir: currentStock,
          sumberTransaksi: `SPPB: ${sppbData.nomorSppb}`,
          keterangan: `Pengeluaran barang via SPPB ${sppbData.nomorSppb}`,
        });
      }
    });

    revalidatePath('/dashboard/sppb');
    revalidatePath(`/dashboard/sppb/${id}`);
    revalidatePath(`/dashboard/spb/${sppbData.spbId}`);
    revalidatePath('/dashboard/barang');
    return {
      success: true,
      message:
        'SPPB berhasil diselesaikan, SPB diubah ke status SELESAI, dan stok telah dikurangi',
    };
  } catch (error: any) {
    console.error('Error completing SPPB:', error);
    return {
      success: false,
      message: error.message || 'Gagal menyelesaikan SPPB',
    };
  }
}

export async function toggleSPPBPrintStatus(id: number) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as any) || 'petugas';

    if (userRole === 'supervisor' || userRole === 'petugas') {
      throw new Error(
        'Anda tidak memiliki akses untuk mengubah status cetak SPPB'
      );
    }
    const existingSPPB = await db.query.sppb.findFirst({
      where: eq(sppb.id, id),
    });

    if (!existingSPPB) {
      return { success: false, message: 'SPPB tidak ditemukan' };
    }

    const newPrintStatus = !existingSPPB.isPrinted;

    await db
      .update(sppb)
      .set({
        isPrinted: newPrintStatus,
        updatedAt: new Date(),
      })
      .where(eq(sppb.id, id));

    revalidatePath('/dashboard/sppb');
    revalidatePath(`/dashboard/sppb/${id}`);

    return {
      success: true,
      message: `Status cetak berhasil diubah menjadi ${
        newPrintStatus ? 'Sudah Dicetak' : 'Belum Dicetak'
      }`,
    };
  } catch (error: any) {
    console.error('Error toggling SPPB print status:', error);
    return {
      success: false,
      message: error.message || 'Gagal mengubah status cetak',
    };
  }
}

// --- DATA FETCHING (Previously in drizzle/data/sppb.ts) ---

export async function getSPPBStats() {
  const [totalResult] = await db.select({ count: count() }).from(sppb);
  const total = totalResult?.count || 0;

  const [menungguBastResult] = await db
    .select({ count: count() })
    .from(sppb)
    .where(eq(sppb.status, 'MENUNGGU_BAST'));
  const menungguBast = menungguBastResult?.count || 0;

  const [selesaiResult] = await db
    .select({ count: count() })
    .from(sppb)
    .where(eq(sppb.status, 'SELESAI'));
  const selesai = selesaiResult?.count || 0;

  return {
    total,
    menungguBast,
    selesai,
  };
}

export async function getSPPBList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'MENUNGGU_BAST' | 'SELESAI' | 'BATAL';
  isPrinted?: boolean;
  spbId?: number;
  pejabatPenyetujuId?: number;
  startDate?: string;
  endDate?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Filter by Status
  if (params?.status) {
    conditions.push(eq(sppb.status, params.status));
  }

  // Filter by Printed Status
  if (params?.isPrinted !== undefined) {
    conditions.push(eq(sppb.isPrinted, params.isPrinted));
  }

  // Filter by SPB
  if (params?.spbId) {
    conditions.push(eq(sppb.spbId, params.spbId));
  }

  // Filter by pejabat penyetuju
  if (params?.pejabatPenyetujuId) {
    conditions.push(eq(sppb.pejabatPenyetujuId, params.pejabatPenyetujuId));
  }

  // Filter by date range
  if (params?.startDate) {
    conditions.push(gte(sppb.tanggalSppb, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(sppb.tanggalSppb, params.endDate));
  }

  // Search: nomor SPPB or nomor SPB
  if (params?.search) {
    const searchTerm = `%${params.search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${sppb.nomorSppb}) LIKE ${searchTerm}`,
        sql`exists (
          select 1
          from "spb"
          where "spb"."id" = ${sppb.spbId}
            and LOWER("spb"."nomor_spb") LIKE ${searchTerm}
        )`
      )
    );
  }

  // Build WHERE clause
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortOrder = params?.sortOrder || 'desc';
  let orderByClause;

  switch (params?.sortBy) {
    case 'nomorSppb':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(sppb.nomorSppb), asc(sppb.id)]
          : [desc(sppb.nomorSppb), desc(sppb.id)];
      break;
    case 'tanggalSppb':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(sppb.tanggalSppb), asc(sppb.id)]
          : [desc(sppb.tanggalSppb), desc(sppb.id)];
      break;
    case 'status':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(sppb.status), asc(sppb.id)]
          : [desc(sppb.status), desc(sppb.id)];
      break;
    case 'isPrinted':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(sppb.isPrinted), asc(sppb.id)]
          : [desc(sppb.isPrinted), desc(sppb.id)];
      break;
    default:
      orderByClause = [desc(sppb.nomorSppb), desc(sppb.id)];
  }

  // Fetch data
  const data = await db.query.sppb.findMany({
    where: whereClause,
    with: {
      spb: {
        columns: {
          id: true,
          nomorSpb: true,
          tanggalSpb: true,
        },
      },
      pejabatPenyetuju: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      diterimaOleh: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      serahTerimaOleh: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
    },
    orderBy: orderByClause,
    limit,
    offset,
  });

  // Count total for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(sppb)
    .where(whereClause);
  const total = totalResult?.count || 0;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSPPBById(id: number) {
  const data = await db.query.sppb.findFirst({
    where: eq(sppb.id, id),
    with: {
      spb: {
        columns: {
          id: true,
          nomorSpb: true,
          tanggalSpb: true,
          status: true,
        },
        with: {
          pemohon: {
            columns: {
              id: true,
              nama: true,
              nip: true,
            },
          },
        },
      },
      pembuat: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      pejabatPenyetuju: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
        with: {
          pegawaiJabatan: {
            where: (pj: any, { eq }: any) => eq(pj.isAktif, true),
            with: {
              jabatan: true,
            },
          },
        },
      },
      serahTerimaOleh: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      diterimaOleh: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      items: {
        with: {
          barang: {
            columns: {
              id: true,
              nama: true,
              kodeBarang: true,
            },
            with: {
              satuan: {
                columns: {
                  nama: true,
                },
              },
            },
          },
        },
      },
      bastKeluarList: {
        columns: {
          id: true,
          nomorBast: true,
          tanggalBast: true,
          grandTotal: true,
        },
      },
    },
  });

  if (!data) {
    return { success: false, message: 'SPPB tidak ditemukan' };
  }

  return { success: true, data };
}
