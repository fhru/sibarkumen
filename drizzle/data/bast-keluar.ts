"use server";

import { db } from "@/lib/db";
import { bastKeluar, bastKeluarDetail, sppb } from "@/drizzle/schema";
import { eq, ilike, and, gte, lte, desc, asc, sql, or } from "drizzle-orm";

export async function getBastKeluarStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [totalStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      totalValue: sql<string>`sum(${bastKeluar.grandTotal})`,
    })
    .from(bastKeluar);

  const [monthStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(bastKeluar)
    .where(gte(bastKeluar.tanggalBast, startOfMonth));

  return {
    total: totalStats?.total || 0,
    totalValue: Number(totalStats?.totalValue) || 0,
    thisMonth: monthStats?.count || 0,
  };
}

export async function getBastKeluarList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isPrinted?: boolean;
  sppbId?: number;
  startDate?: string;
  endDate?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Filter by SPPB
  if (params?.sppbId) {
    conditions.push(eq(bastKeluar.sppbId, params.sppbId));
  }

  // Filter by Printed Status
  if (params?.isPrinted !== undefined) {
    conditions.push(eq(bastKeluar.isPrinted, params.isPrinted));
  }

  // Filter by date range
  if (params?.startDate) {
    conditions.push(gte(bastKeluar.tanggalBast, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(bastKeluar.tanggalBast, params.endDate));
  }

  // Search: nomor BAST or nomor SPPB
  if (params?.search) {
    const searchTerm = `%${params.search}%`;
    conditions.push(
      or(
        ilike(bastKeluar.nomorBast, searchTerm),
        sql`exists (
          select 1
          from "sppb"
          where "sppb"."id" = ${bastKeluar.sppbId}
            and "sppb"."nomor_sppb" ILIKE ${searchTerm}
        )`,
      ),
    );
  }

  // Build WHERE clause
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortOrder = params?.sortOrder || "desc";
  let orderByClause;

  switch (params?.sortBy) {
    case "nomorBast":
      orderByClause =
        sortOrder === "asc"
          ? [asc(bastKeluar.nomorBast), asc(bastKeluar.id)]
          : [desc(bastKeluar.nomorBast), desc(bastKeluar.id)];
      break;
    case "tanggalBast":
      orderByClause =
        sortOrder === "asc"
          ? [asc(bastKeluar.tanggalBast), asc(bastKeluar.id)]
          : [desc(bastKeluar.tanggalBast), desc(bastKeluar.id)];
      break;
    default:
      orderByClause = [desc(bastKeluar.nomorBast), desc(bastKeluar.id)];
  }

  // Fetch data
  const data = await db.query.bastKeluar.findMany({
    where: whereClause,
    with: {
      sppb: {
        columns: {
          id: true,
          nomorSppb: true,
          tanggalSppb: true,
        },
      },
      pihakPertama: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
        with: {
          pegawaiJabatan: {
            where: (pj: any, { eq }: any) => eq(pj.isAktif, true),
            with: {
              jabatan: {
                columns: {
                  nama: true,
                },
              },
            },
          },
        },
      },
      pihakKedua: {
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

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bastKeluar)
    .where(whereClause);

  const totalPages = Math.ceil(count / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
    },
  };
}

export async function getBastKeluarById(id: number) {
  const data = await db.query.bastKeluar.findFirst({
    where: eq(bastKeluar.id, id),
    with: {
      sppb: {
        columns: {
          id: true,
          nomorSppb: true,
          tanggalSppb: true,
          spbId: true,
        },
        with: {
          spb: {
            columns: {
              id: true,
              nomorSpb: true,
            },
          },
        },
      },
      pihakPertama: {
        columns: {
          id: true,
          nama: true,
          nip: true,
        },
        with: {
          pegawaiJabatan: {
            where: (pj: any, { eq }: any) => eq(pj.isAktif, true),
            with: {
              jabatan: {
                columns: {
                  nama: true,
                },
              },
            },
          },
        },
      },
      pihakKedua: {
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
    },
  });

  if (!data) {
    return {
      success: false,
      message: "BAST Keluar tidak ditemukan",
      data: null,
    };
  }

  return { success: true, data };
}
