import { db } from "@/lib/db";
import { bastMasuk, bastKeluar, spb, sppb } from "@/drizzle/schema";
import { documentNumbering, DocumentType } from "@/config/document-numbering";
import { desc, like, eq } from "drizzle-orm";

function parseNumberFromFormatted(value: string, type: DocumentType): number {
  if (!value) return NaN;
  if (type === "bastMasuk") {
    const lastDot = value.lastIndexOf(".");
    const suffix = lastDot >= 0 ? value.slice(lastDot + 1) : value;
    return parseInt(suffix, 10);
  }
  const parts = value.split("/");
  return parseInt(parts[0], 10);
}

export async function generateDocumentNumber(type: DocumentType) {
  const config = documentNumbering[type];
  const currentYear = new Date().getFullYear().toString();

  const pattern = config.format
    .replace("{year}", currentYear)
    .replace("{number}", "%");

  let nextNumber = config.startNumber;

  if (type === "bastMasuk") {
    const latest = await db
      .select({ nomor: bastMasuk.nomorReferensi })
      .from(bastMasuk)
      .where(like(bastMasuk.nomorReferensi, pattern))
      .orderBy(desc(bastMasuk.id))
      .limit(1);

    if (latest.length > 0) {
      const parsed = parseNumberFromFormatted(latest[0].nomor, type);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }
  } else if (type === "spb") {
    const latest = await db
      .select({ nomor: spb.nomorSpb })
      .from(spb)
      .where(like(spb.nomorSpb, pattern))
      .orderBy(desc(spb.id))
      .limit(1);

    if (latest.length > 0) {
      const parsed = parseNumberFromFormatted(latest[0].nomor, type);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }
  } else if (type === "sppb") {
    const latest = await db
      .select({ nomor: sppb.nomorSppb })
      .from(sppb)
      .where(like(sppb.nomorSppb, pattern))
      .orderBy(desc(sppb.id))
      .limit(1);

    if (latest.length > 0) {
      const parsed = parseNumberFromFormatted(latest[0].nomor, type);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }
  } else if (type === "bastKeluar") {
    const latest = await db
      .select({ nomor: bastKeluar.nomorBast })
      .from(bastKeluar)
      .where(like(bastKeluar.nomorBast, pattern))
      .orderBy(desc(bastKeluar.id))
      .limit(1);

    if (latest.length > 0) {
      const parsed = parseNumberFromFormatted(latest[0].nomor, type);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }
  }

  const numberStr =
    config.numberPadding > 0
      ? nextNumber.toString().padStart(config.numberPadding, "0")
      : nextNumber.toString();

  return config.format
    .replace("{year}", currentYear)
    .replace("{number}", numberStr);
}

async function documentNumberExists(type: DocumentType, number: string) {
  if (type === "bastMasuk") {
    const rows = await db
      .select({ id: bastMasuk.id })
      .from(bastMasuk)
      .where(eq(bastMasuk.nomorReferensi, number))
      .limit(1);
    return rows.length > 0;
  }
  if (type === "spb") {
    const rows = await db
      .select({ id: spb.id })
      .from(spb)
      .where(eq(spb.nomorSpb, number))
      .limit(1);
    return rows.length > 0;
  }
  if (type === "sppb") {
    const rows = await db
      .select({ id: sppb.id })
      .from(sppb)
      .where(eq(sppb.nomorSppb, number))
      .limit(1);
    return rows.length > 0;
  }
  const rows = await db
    .select({ id: bastKeluar.id })
    .from(bastKeluar)
    .where(eq(bastKeluar.nomorBast, number))
    .limit(1);
  return rows.length > 0;
}

export async function generateDocumentNumberWithRetry(
  type: DocumentType,
  options?: { maxRetries?: number; delayMs?: number },
) {
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 100;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const number = await generateDocumentNumber(type);
    const exists = await documentNumberExists(type, number);
    if (!exists) return number;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `Gagal menghasilkan nomor dokumen unik untuk ${type} setelah ${maxRetries} percobaan.`,
  );
}
