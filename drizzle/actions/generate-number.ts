"use server";

import { db } from "@/lib/db";
import { spb, sppb, bastKeluar } from "@/drizzle/schema";
import { desc, like } from "drizzle-orm";
import {
  documentNumbering,
  type DocumentType,
} from "@/config/document-numbering";

export async function generateNextDocumentNumber(
  documentType: DocumentType,
): Promise<string> {
  const config = documentNumbering[documentType];
  const currentYear = new Date().getFullYear();

  // Get the latest document number for current year
  const pattern = config.format
    .replace("{year}", String(currentYear))
    .replace("{number}", "%");

  let nextNumber = config.startNumber;

  // Type-safe approach: handle each document type separately
  if (documentType === "spb") {
    const latestDoc = await db
      .select()
      .from(spb)
      .where(like(spb.nomorSpb, pattern))
      .orderBy(desc(spb.id))
      .limit(1);

    if (latestDoc.length > 0) {
      const parts = latestDoc[0].nomorSpb.split("/");
      // New format: {number}/-077/SPB/{year}, so number is the first part
      const currentNumber = parseInt(parts[0]) || 0;
      nextNumber = currentNumber + 1;
    }
  } else if (documentType === "sppb") {
    const latestDoc = await db
      .select()
      .from(sppb)
      .where(like(sppb.nomorSppb, pattern))
      .orderBy(desc(sppb.id))
      .limit(1);

    if (latestDoc.length > 0) {
      const parts = latestDoc[0].nomorSppb.split("/");
      // New format: {number}/-077/SPPB/{year}, so number is the first part
      const currentNumber = parseInt(parts[0]) || 0;
      nextNumber = currentNumber + 1;
    }
  } else if (documentType === "bastKeluar") {
    const latestDoc = await db
      .select()
      .from(bastKeluar)
      .where(like(bastKeluar.nomorBast, pattern))
      .orderBy(desc(bastKeluar.id))
      .limit(1);

    if (latestDoc.length > 0) {
      const parts = latestDoc[0].nomorBast.split("/");
      // New format: {number}/-077/BAST/{year}, so number is the first part
      const currentNumber = parseInt(parts[0]) || 0;
      nextNumber = currentNumber + 1;
    }
  }

  // Format the number with padding (only if numberPadding > 0)
  const paddedNumber =
    config.numberPadding > 0
      ? String(nextNumber).padStart(config.numberPadding, "0")
      : String(nextNumber);

  // Generate the document number
  const documentNumber = config.format
    .replace("{year}", String(currentYear))
    .replace("{number}", paddedNumber);

  return documentNumber;
}

function replaceDocumentType(
  baseNumber: string,
  fromType: string,
  toType: string,
): string {
  const token = `/${fromType}/`;
  if (baseNumber.includes(token)) {
    return baseNumber.replace(token, `/${toType}/`);
  }
  return baseNumber.replace(fromType, toType);
}

// Specific function for SPB
export async function generateNextSPBNumber(): Promise<string> {
  return generateNextDocumentNumber("spb");
}

// Specific function for SPPB
export async function generateSPPBNumber(): Promise<string> {
  return generateNextDocumentNumber("sppb");
}

export async function generateSPPBNumberFromSPB(
  nomorSpb: string,
): Promise<string> {
  return replaceDocumentType(nomorSpb, "SPB", "SPPB");
}

// Specific function for BAST Keluar
export async function generateBastKeluarNumber(): Promise<string> {
  return generateNextDocumentNumber("bastKeluar");
}

export async function generateBastKeluarNumberFromSPB(
  nomorSpb: string,
): Promise<string> {
  return replaceDocumentType(nomorSpb, "SPB", "BAST");
}
