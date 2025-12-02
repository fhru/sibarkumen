"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";
import { generateDocumentNumber } from "@/lib/number-generator";
import { ErrorTypes, createError, logError } from "@/lib/error-types";

const SpbDetailSchema = z.object({
  idBarang: z.number().min(1, "Barang wajib dipilih"),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
});

const SpbSchema = z.object({
  nomorSpb: z.string().optional(),
  tanggalSpb: z.date(),
  pemohonId: z.number().min(1, "Pemohon wajib dipilih"),
  keterangan: z.string().optional(),
  details: z
    .array(SpbDetailSchema)
    .min(1, "Minimal satu barang harus ditambahkan"),
});

// Core fetch function
async function fetchSpbList({ page = 1, limit = 10, query = "" }) {
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { nomorSpb: { contains: query, mode: "insensitive" } },
      { pemohon: { nama: { contains: query, mode: "insensitive" } } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.spb.findMany({
      where,
      include: {
        pemohon: true,
        details: { include: { barang: true } },
        sppbList: { select: { id: true, nomorSppb: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.spb.count({ where }),
  ]);

  const safeData = data.map((item) => ({
    ...item,
    hasSppb: item.sppbList.length > 0,
    sppbId: item.sppbList[0]?.id,
    details: item.details.map((d) => ({
      ...d,
      barang: d.barang
        ? {
            ...d.barang,
            hargaSatuan: d.barang.hargaSatuan.toNumber(),
            totalHarga: d.barang.totalHarga.toNumber(),
          }
        : null,
    })),
  }));

  return {
    data: safeData,
    metadata: {
      hasNextPage: skip + limit < total,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
}

// Cached version
const getCachedSpbList = unstable_cache(fetchSpbList, ["spb-list"], {
  revalidate: 60,
  tags: ["spb"],
});

export async function getSpbList(params) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, "Anda harus login");

  try {
    return await getCachedSpbList(params);
  } catch (error) {
    logError("getSpbList", error);
    return createError(ErrorTypes.DATABASE_ERROR, "Gagal mengambil data SPB");
  }
}

export async function createSpb(data) {
  const session = await auth();
  if (!session) return createError(ErrorTypes.UNAUTHORIZED, "Anda harus login");

  const validation = SpbSchema.safeParse({
    ...data,
    tanggalSpb: new Date(data.tanggalSpb),
  });

  if (!validation.success) {
    return createError(
      ErrorTypes.VALIDATION_ERROR,
      "Validasi gagal",
      validation.error.flatten(),
    );
  }

  const { details, ...header } = validation.data;

  try {
    if (!header.nomorSpb) {
      header.nomorSpb = await generateDocumentNumber(
        "SPB",
        "spb",
        "tanggalSpb",
      );
    }

    for (const item of details) {
      const barang = await prisma.barang.findUnique({
        where: { id: item.idBarang },
      });
      if (!barang)
        return createError(
          ErrorTypes.NOT_FOUND,
          `Barang ID ${item.idBarang} tidak ditemukan`,
        );
      if (barang.stokTersedia < item.jumlah) {
        return createError(
          ErrorTypes.VALIDATION_ERROR,
          `Stok ${barang.namaBarang} tidak mencukupi. Tersedia: ${barang.stokTersedia}`,
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      const spb = await tx.spb.create({ data: header });
      for (const item of details) {
        await tx.spbDetail.create({
          data: { idSpb: spb.id, idBarang: item.idBarang, jumlah: item.jumlah },
        });
      }
    });

    revalidatePath("/dashboard/spb");
    revalidatePath("/dashboard");
    return { success: true, message: "Permintaan Barang berhasil dibuat" };
  } catch (error) {
    logError("createSpb", error);
    return createError(ErrorTypes.DATABASE_ERROR, "Gagal menyimpan SPB");
  }
}

export async function revalidateSpbCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("spb");
}
