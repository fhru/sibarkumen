"use server";

import { generateDocumentNumber } from "@/lib/document-numbering-utils";
import { type DocumentType } from "@/config/document-numbering";

export async function generateNextDocumentNumber(
  documentType: DocumentType,
): Promise<string> {
  return generateDocumentNumber(documentType);
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
