import { db } from "@/lib/db";
import { sppb, sppbDetail, barang, pegawai, spb } from "@/drizzle/schema";
import {
  count,
  desc,
  eq,
  sql,
  and,
  gte,
  lte,
  asc,
  or,
  like,
} from "drizzle-orm";

export async function getSPPBStats() {
  const [totalResult] = await db.select({ count: count() }).from(sppb);
  const total = totalResult?.count || 0;

  const [menungguBastResult] = await db
    .select({ count: count() })
    .from(sppb)
    .where(eq(sppb.status, "MENUNGGU_BAST"));
  const menungguBast = menungguBastResult?.count || 0;

  const [selesaiResult] = await db
    .select({ count: count() })
    .from(sppb)
    .where(eq(sppb.status, "SELESAI"));
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
  sortOrder?: "asc" | "desc";
  status?: "MENUNGGU_BAST" | "SELESAI" | "BATAL";
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
        )`,
      ),
    );
  }

  // Build WHERE clause
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortOrder = params?.sortOrder || "desc";
  let orderByClause;

  switch (params?.sortBy) {
    case "nomorSppb":
      orderByClause =
        sortOrder === "asc"
          ? [asc(sppb.nomorSppb), asc(sppb.id)]
          : [desc(sppb.nomorSppb), desc(sppb.id)];
      break;
    case "tanggalSppb":
      orderByClause =
        sortOrder === "asc"
          ? [asc(sppb.tanggalSppb), asc(sppb.id)]
          : [desc(sppb.tanggalSppb), desc(sppb.id)];
      break;
    case "status":
      orderByClause =
        sortOrder === "asc"
          ? [asc(sppb.status), asc(sppb.id)]
          : [desc(sppb.status), desc(sppb.id)];
      break;
    case "isPrinted":
      orderByClause =
        sortOrder === "asc"
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
    return { success: false, message: "SPPB tidak ditemukan" };
  }

  return { success: true, data };
}
