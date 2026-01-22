import { db } from '@/lib/db';
import { spb, spbDetail, barang, pegawai } from '@/drizzle/schema';
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
} from 'drizzle-orm';

export async function getSPBStats() {
  // Total SPB
  const [totalResult] = await db.select({ count: count() }).from(spb);
  const total = totalResult?.count || 0;

  // By Status
  const [draftResult] = await db
    .select({ count: count() })
    .from(spb)
    .where(eq(spb.status, 'MENUNGGU_SPPB'));
  const menungguSppb = draftResult?.count || 0;

  const [selesaiResult] = await db
    .select({ count: count() })
    .from(spb)
    .where(eq(spb.status, 'SELESAI'));
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
  sortOrder?: 'asc' | 'desc';
  status?: 'MENUNGGU_SPPB' | 'SELESAI' | 'BATAL';
  isPrinted?: boolean;
  pemohonId?: number;
  startDate?: string;
  endDate?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Filter by status
  if (params?.status) {
    conditions.push(eq(spb.status, params.status));
  }

  if (params?.isPrinted !== undefined) {
    conditions.push(eq(spb.isPrinted, params.isPrinted));
  }

  // Filter by pemohon
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
        sql`LOWER(${pegawai.nama}) LIKE ${searchTerm}`
      )
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
  const sortOrder = params?.sortOrder || 'desc';

  switch (params?.sortBy) {
    case 'nomorSpb':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(spb.nomorSpb), asc(spb.id)]
          : [desc(spb.nomorSpb), desc(spb.id)];
      break;
    case 'tanggalSpb':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(spb.tanggalSpb), asc(spb.id)]
          : [desc(spb.tanggalSpb), desc(spb.id)];
      break;
    case 'pemohon':
      orderByClause =
        sortOrder === 'asc'
          ? [asc(pegawai.nama), asc(spb.id)]
          : [desc(pegawai.nama), desc(spb.id)];
      break;
    case 'status':
      orderByClause =
        sortOrder === 'asc'
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
      itemCount: count().as('item_count'),
    })
    .from(spbDetail)
    .groupBy(spbDetail.spbId)
    .as('item_counts');

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
