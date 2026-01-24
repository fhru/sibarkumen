"use server";

import { db } from "@/lib/db";
import { spb, spbDetail, pegawai } from "@/drizzle/schema";
import { eq, count, desc, sql, and, gte, lte, asc, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, getCurrentPegawai } from "@/lib/auth-utils";
import { Role } from "@/config/nav-items";

// Helper to check authentication
async function checkAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// Zod Schemas
import { createSpbSchema } from "@/lib/zod/spb-schema";

// Helper to format date
function formatDateForDB(date: string | Date): string {
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createSPB(
  prevState: any,
  data: z.infer<typeof createSpbSchema>,
) {
  try {
    const session = await checkAuth();
    const validated = createSpbSchema.parse(data);

    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      throw new Error("Supervisor tidak dapat membuat SPB");
    }

    let pemohonId = validated.pemohonId;

    if (userRole === "petugas") {
      const profile = await getCurrentPegawai();
      if (!profile) {
        throw new Error("Profil pegawai tidak ditemukan. Harap hubungi admin.");
      }
      pemohonId = profile.id;
    }

    const tglSpb = formatDateForDB(validated.tanggalSpb);

    await db.transaction(async (tx) => {
      // 1. Create SPB Header
      const [newSpb] = await tx
        .insert(spb)
        .values({
          nomorSpb: validated.nomorSpb,
          tanggalSpb: tglSpb,
          pemohonId: pemohonId,
          jabatanId: validated.jabatanId,
          keterangan: validated.keterangan,
          status: "MENUNGGU_SPPB",
        })
        .returning();

      // 2. Create SPB Details
      for (const item of validated.items) {
        await tx.insert(spbDetail).values({
          spbId: newSpb.id,
          barangId: item.barangId,
          qtyPermintaan: item.qtyPermintaan,
          keterangan: item.keterangan,
        });
      }
    });

    revalidatePath("/dashboard/spb");
    return { success: true, message: "SPB berhasil dibuat" };
  } catch (error: any) {
    // Handle unique constraint errors
    if (error.code === "23505") {
      const errorMessage = error.message || "";
      if (errorMessage.includes("nomor_spb")) {
        return { success: false, message: "Nomor SPB sudah digunakan" };
      }
    }

    return {
      success: false,
      message: error.message || "Gagal membuat SPB",
    };
  }
}

export async function updateSPB(
  id: number,
  prevState: any,
  data: z.infer<typeof createSpbSchema>,
) {
  try {
    const session = await checkAuth();
    const validated = createSpbSchema.parse(data);

    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      throw new Error("Supervisor tidak dapat mengedit SPB");
    }

    let pemohonId = validated.pemohonId;

    if (userRole === "petugas") {
      const profile = await getCurrentPegawai();
      if (!profile) {
        throw new Error("Profil pegawai tidak ditemukan. Harap hubungi admin.");
      }
      pemohonId = profile.id;
    }

    const tglSpb = formatDateForDB(validated.tanggalSpb);

    await db.transaction(async (tx) => {
      // Check if SPB exists and is editable
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error("SPB tidak ditemukan");
      }

      // Allow edit only if status is MENUNGGU_SPPB
      if (existingSpb.status !== "MENUNGGU_SPPB") {
        throw new Error("SPB yang sudah diproses tidak dapat diedit");
      }

      // Check ownership for petugas
      if (userRole === "petugas" && existingSpb.pemohonId !== pemohonId) {
        throw new Error("Anda tidak memiliki izin untuk mengedit SPB ini");
      }

      // 1. Update SPB Header
      await tx
        .update(spb)
        .set({
          nomorSpb: validated.nomorSpb,
          tanggalSpb: tglSpb,
          pemohonId: pemohonId,
          jabatanId: validated.jabatanId,
          keterangan: validated.keterangan,
          updatedAt: new Date(),
        })
        .where(eq(spb.id, id));

      // 2. Delete old details
      await tx.delete(spbDetail).where(eq(spbDetail.spbId, id));

      // 3. Insert new details
      for (const item of validated.items) {
        await tx.insert(spbDetail).values({
          spbId: id,
          barangId: item.barangId,
          qtyPermintaan: item.qtyPermintaan,
          keterangan: item.keterangan,
        });
      }
    });

    revalidatePath("/dashboard/spb");
    revalidatePath(`/dashboard/spb/${id}`);
    return { success: true, message: "SPB berhasil diupdate" };
  } catch (error: any) {
    if (error.code === "23505") {
      const errorMessage = error.message || "";
      if (errorMessage.includes("nomor_spb")) {
        return { success: false, message: "Nomor SPB sudah digunakan" };
      }
    }

    return {
      success: false,
      message: error.message || "Gagal mengupdate SPB",
    };
  }
}

export async function deleteSPB(id: number) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor") {
      throw new Error("Supervisor tidak dapat menghapus SPB");
    }

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error("SPB tidak ditemukan");
      }

      // Check ownership for petugas
      if (userRole === "petugas") {
        const profile = await getCurrentPegawai();
        if (!profile || existingSpb.pemohonId !== profile.id) {
          throw new Error("Anda tidak memiliki izin untuk menghapus SPB ini");
        }
      }

      // Delete SPB (cascade will delete details)
      await tx.delete(spb).where(eq(spb.id, id));
    });

    revalidatePath("/dashboard/spb");
    return { success: true, message: "SPB berhasil dihapus" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus SPB",
    };
  }
}

export async function toggleSPBPrintStatus(id: number, isPrinted: boolean) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || "petugas";

    // If role is Supervisor, they can NEVER toggle print status
    if (userRole === "supervisor") {
      throw new Error(
        "Anda tidak memiliki izin untuk mengubah status cetak SPB",
      );
    }

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error("SPB tidak ditemukan");
      }

      // Special check for petugas: Can only toggle if status is SELESAI
      if (userRole === "petugas" && existingSpb.status !== "SELESAI") {
        throw new Error(
          "Anda tidak memiliki izin untuk mengubah status cetak SPB ini (Status belum SELESAI)",
        );
      }

      await tx
        .update(spb)
        .set({
          isPrinted: isPrinted,
          updatedAt: new Date(),
        })
        .where(eq(spb.id, id));
    });

    revalidatePath("/dashboard/spb");
    revalidatePath(`/dashboard/spb/${id}`);
    const message = isPrinted
      ? "SPB ditandai sudah dicetak"
      : "SPB ditandai belum dicetak";
    return { success: true, message };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengubah status cetak SPB",
    };
  }
}

export async function cancelSPB(id: number) {
  try {
    const session = await checkAuth();
    const userRole = (session.user.role as Role) || "petugas";

    if (userRole === "supervisor" || userRole === "petugas") {
      throw new Error("Anda tidak memiliki izin untuk membatalkan SPB");
    }

    await db.transaction(async (tx) => {
      const existingSpb = await tx.query.spb.findFirst({
        where: eq(spb.id, id),
      });

      if (!existingSpb) {
        throw new Error("SPB tidak ditemukan");
      }

      if (existingSpb.status === "SELESAI") {
        throw new Error("SPB yang sudah selesai tidak dapat dibatalkan");
      }

      await tx
        .update(spb)
        .set({
          status: "BATAL",
          updatedAt: new Date(),
        })
        .where(eq(spb.id, id));
    });

    revalidatePath("/dashboard/spb");
    revalidatePath(`/dashboard/spb/${id}`);
    return { success: true, message: "SPB berhasil dibatalkan" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal membatalkan SPB",
    };
  }
}

// --- DATA FETCHING (Previously in drizzle/data/spb.ts) ---

export async function getSPBStats() {
  const session = await getSession();
  const user = session?.user;
  const role = (user?.role as Role) || "petugas";

  let filter = undefined;

  if (role === "petugas") {
    const profile = await getCurrentPegawai();
    if (profile) {
      filter = eq(spb.pemohonId, profile.id);
    } else {
      // If petugas has no pegawai record, they should see 0
      return { total: 0, menungguSppb: 0, selesai: 0 };
    }
  }

  // Total SPB
  const [totalResult] = await db
    .select({ count: count() })
    .from(spb)
    .where(filter);
  const total = totalResult?.count || 0;

  // By Status
  const [draftResult] = await db
    .select({ count: count() })
    .from(spb)
    .where(and(eq(spb.status, "MENUNGGU_SPPB"), filter));
  const menungguSppb = draftResult?.count || 0;

  const [selesaiResult] = await db
    .select({ count: count() })
    .from(spb)
    .where(and(eq(spb.status, "SELESAI"), filter));
  const selesai = selesaiResult?.count || 0;

  return {
    total,
    menungguSppb,
    selesai,
  };
}

export async function getSPBList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "MENUNGGU_SPPB" | "SELESAI" | "BATAL";
  isPrinted?: boolean;
  pemohonId?: number;
  startDate?: string;
  endDate?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  const session = await getSession();
  const user = session?.user;
  const role = (user?.role as Role) || "petugas";

  if (role === "petugas") {
    const profile = await getCurrentPegawai();
    if (profile) {
      conditions.push(eq(spb.pemohonId, profile.id));
    } else {
      // If petugas has no pegawai record, return empty list
      return {
        data: [],
        meta: { total: 0, pageCount: 0, page: 1, limit },
      };
    }
  }

  // Filter by status
  if (params?.status) {
    conditions.push(eq(spb.status, params.status));
  }

  if (params?.isPrinted !== undefined) {
    conditions.push(eq(spb.isPrinted, params.isPrinted));
  }

  // Filter by pemohon (manual filter from params, e.g. by Admin)
  if (params?.pemohonId) {
    conditions.push(eq(spb.pemohonId, params.pemohonId));
  }

  // Filter by date range
  if (params?.startDate) {
    conditions.push(gte(spb.tanggalSpb, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(spb.tanggalSpb, params.endDate));
  }

  // Search: nomor SPB or pemohon name
  if (params?.search) {
    const searchTerm = `%${params.search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${spb.nomorSpb}) LIKE ${searchTerm}`,
        sql`LOWER(${pegawai.nama}) LIKE ${searchTerm}`,
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(spb)
    .leftJoin(pegawai, eq(spb.pemohonId, pegawai.id))
    .where(whereClause);

  const total = totalResult?.count || 0;
  const pageCount = Math.ceil(total / limit);

  // Determine sort column and order
  let orderByClause;
  const sortOrder = params?.sortOrder || "desc";

  switch (params?.sortBy) {
    case "nomorSpb":
      orderByClause =
        sortOrder === "asc"
          ? [asc(spb.nomorSpb), asc(spb.id)]
          : [desc(spb.nomorSpb), desc(spb.id)];
      break;
    case "tanggalSpb":
      orderByClause =
        sortOrder === "asc"
          ? [asc(spb.tanggalSpb), asc(spb.id)]
          : [desc(spb.tanggalSpb), desc(spb.id)];
      break;
    case "pemohon":
      orderByClause =
        sortOrder === "asc"
          ? [asc(pegawai.nama), asc(spb.id)]
          : [desc(pegawai.nama), desc(spb.id)];
      break;
    case "status":
      orderByClause =
        sortOrder === "asc"
          ? [asc(spb.status), asc(spb.id)]
          : [desc(spb.status), desc(spb.id)];
      break;
    default:
      orderByClause = [desc(spb.nomorSpb), desc(spb.id)];
  }

  // Subquery to count items per SPB
  const itemCountSubquery = db
    .select({
      spbId: spbDetail.spbId,
      itemCount: count().as("item_count"),
    })
    .from(spbDetail)
    .groupBy(spbDetail.spbId)
    .as("item_counts");

  // Get paginated data
  const data = await db
    .select({
      id: spb.id,
      nomorSpb: spb.nomorSpb,
      tanggalSpb: spb.tanggalSpb,
      pemohonId: spb.pemohonId,
      status: spb.status,
      isPrinted: spb.isPrinted,
      keterangan: spb.keterangan,
      createdAt: spb.createdAt,
      updatedAt: spb.updatedAt,
      pemohon: {
        id: pegawai.id,
        nama: pegawai.nama,
        nip: pegawai.nip,
      },
      totalItems: sql<number>`COALESCE(${itemCountSubquery.itemCount}, 0)`,
    })
    .from(spb)
    .leftJoin(pegawai, eq(spb.pemohonId, pegawai.id))
    .leftJoin(itemCountSubquery, eq(spb.id, itemCountSubquery.spbId))
    .where(whereClause)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset);

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

export async function getSPBById(id: number) {
  const data = await db.query.spb.findFirst({
    where: eq(spb.id, id),
    with: {
      pemohon: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
      },
      jabatan: {
        columns: {
          nama: true,
          unitKerja: true,
        },
      },
      items: {
        with: {
          barang: {
            columns: {
              id: true,
              nama: true,
              kodeBarang: true,
              stok: true,
              satuanId: true,
            },
            with: {
              satuan: true,
            },
          },
        },
      },
      sppbList: {
        columns: {
          id: true,
          nomorSppb: true,
          tanggalSppb: true,
        },
      },
    },
  });

  return data;
}
