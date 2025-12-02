"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";

// Error Types
const ErrorTypes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

// Build where clause for each document type
function buildWhereClause(
  query,
  startDate,
  endDate,
  dateField,
  numberField,
  actorRelation,
) {
  const conditions = [];

  // Search by document number or actor name
  if (query) {
    conditions.push({
      OR: [
        { [numberField]: { contains: query, mode: "insensitive" } },
        { [actorRelation]: { nama: { contains: query, mode: "insensitive" } } },
      ],
    });
  }

  // Date range filter
  if (startDate || endDate) {
    const dateCondition = {};
    if (startDate) dateCondition.gte = new Date(startDate);
    if (endDate) dateCondition.lte = new Date(endDate);
    conditions.push({ [dateField]: dateCondition });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

// Core fetch function (will be cached)
async function fetchArsipData({
  cursor,
  limit,
  query,
  type,
  startDate,
  endDate,
}) {
  const fetchPromises = [];
  const takeAmount = limit + 1; // Take one extra to check if there's more

  // 1. BAST Masuk
  if (type === "ALL" || type === "BAST_MASUK") {
    const where = buildWhereClause(
      query,
      startDate,
      endDate,
      "tanggalBast",
      "nomorBast",
      "pptkPpk",
    );
    fetchPromises.push(
      prisma.bastMasuk
        .findMany({
          where,
          take: takeAmount,
          ...(cursor?.BAST_MASUK
            ? { cursor: { id: cursor.BAST_MASUK }, skip: 1 }
            : {}),
          orderBy: { tanggalBast: "desc" },
          include: { pptkPpk: true },
        })
        .then((res) =>
          res.map((item) => ({
            id: item.id,
            type: "BAST_MASUK",
            number: item.nomorBast,
            date: item.tanggalBast,
            actor: item.pptkPpk?.nama,
            description: item.asalPembelian,
          })),
        ),
    );
  }

  // 2. SPB
  if (type === "ALL" || type === "SPB") {
    const where = buildWhereClause(
      query,
      startDate,
      endDate,
      "tanggalSpb",
      "nomorSpb",
      "pemohon",
    );
    fetchPromises.push(
      prisma.spb
        .findMany({
          where,
          take: takeAmount,
          ...(cursor?.SPB ? { cursor: { id: cursor.SPB }, skip: 1 } : {}),
          orderBy: { tanggalSpb: "desc" },
          include: { pemohon: true },
        })
        .then((res) =>
          res.map((item) => ({
            id: item.id,
            type: "SPB",
            number: item.nomorSpb,
            date: item.tanggalSpb,
            actor: item.pemohon?.nama,
            description: item.keterangan,
          })),
        ),
    );
  }

  // 3. SPPB
  if (type === "ALL" || type === "SPPB") {
    const where = buildWhereClause(
      query,
      startDate,
      endDate,
      "tanggalSppb",
      "nomorSppb",
      "penerima",
    );
    fetchPromises.push(
      prisma.sppb
        .findMany({
          where,
          take: takeAmount,
          ...(cursor?.SPPB ? { cursor: { id: cursor.SPPB }, skip: 1 } : {}),
          orderBy: { tanggalSppb: "desc" },
          include: { penerima: true },
        })
        .then((res) =>
          res.map((item) => ({
            id: item.id,
            type: "SPPB",
            number: item.nomorSppb,
            date: item.tanggalSppb,
            actor: item.penerima?.nama,
            description: item.keterangan,
          })),
        ),
    );
  }

  // 4. BAST Keluar
  if (type === "ALL" || type === "BAST_KELUAR") {
    const where = buildWhereClause(
      query,
      startDate,
      endDate,
      "tanggalBast",
      "nomorBast",
      "pihakMenerima",
    );
    fetchPromises.push(
      prisma.bastKeluar
        .findMany({
          where,
          take: takeAmount,
          ...(cursor?.BAST_KELUAR
            ? { cursor: { id: cursor.BAST_KELUAR }, skip: 1 }
            : {}),
          orderBy: { tanggalBast: "desc" },
          include: { pihakMenerima: true },
        })
        .then((res) =>
          res.map((item) => ({
            id: item.id,
            type: "BAST_KELUAR",
            number: item.nomorBast,
            date: item.tanggalBast,
            actor: item.pihakMenerima?.nama,
            description: item.keterangan,
          })),
        ),
    );
  }

  const results = await Promise.all(fetchPromises);
  return results;
}

// Cached version of fetch function
const getCachedArsipData = unstable_cache(fetchArsipData, ["arsip-list"], {
  revalidate: 60,
  tags: ["arsip"],
});

export async function getArsipList({
  page = null,
  cursor = null,
  limit = 20,
  query = "",
  type = "ALL",
  startDate = null,
  endDate = null,
  useCache = true,
}) {
  const session = await auth();
  if (!session) {
    return {
      error: ErrorTypes.UNAUTHORIZED,
      message: "Anda harus login untuk mengakses data ini",
    };
  }

  // Validate parameters
  if (limit < 1 || limit > 100) {
    return {
      error: ErrorTypes.VALIDATION_ERROR,
      message: "Limit harus antara 1 dan 100",
    };
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return {
      error: ErrorTypes.VALIDATION_ERROR,
      message: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
    };
  }

  const validTypes = ["ALL", "BAST_MASUK", "SPB", "SPPB", "BAST_KELUAR"];
  if (!validTypes.includes(type)) {
    return {
      error: ErrorTypes.VALIDATION_ERROR,
      message: `Tipe dokumen tidak valid. Pilih salah satu: ${validTypes.join(", ")}`,
    };
  }

  try {
    const params = { cursor, limit, query, type, startDate, endDate };
    const results = useCache
      ? await getCachedArsipData(params)
      : await fetchArsipData(params);

    let combined = results.flat();

    // Sort by Date Desc
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = combined.length;

    // Support both page-based (backward compatibility) and cursor-based pagination
    if (page !== null) {
      const skip = (page - 1) * limit;
      const pagedData = combined.slice(skip, skip + limit);

      return {
        data: pagedData,
        metadata: {
          hasNextPage: skip + limit < total,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          currentPage: page,
          filters: {
            query: query || null,
            type,
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
      };
    }

    // Cursor-based pagination
    const hasNextPage = combined.length > limit;
    if (hasNextPage) {
      combined = combined.slice(0, limit);
    }

    // Build next cursor from last items of each type
    const nextCursor = hasNextPage ? {} : null;
    if (hasNextPage) {
      const lastItems = {};
      for (const item of combined) {
        lastItems[item.type] = item.id;
      }
      Object.assign(nextCursor, lastItems);
    }

    return {
      data: combined,
      metadata: {
        hasNextPage,
        nextCursor,
        totalItems: combined.length,
        filters: {
          query: query || null,
          type,
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    };
  } catch (error) {
    console.error("Fetch Arsip Error:", {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    return {
      error: ErrorTypes.DATABASE_ERROR,
      message: "Gagal mengambil data arsip",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
}

// Revalidate cache function (can be called after mutations)
export async function revalidateArsipCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("arsip");
}
