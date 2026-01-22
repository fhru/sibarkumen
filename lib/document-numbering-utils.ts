import { db } from '@/lib/db';
import { bastMasuk, bastKeluar, spb, sppb } from '@/drizzle/schema';
import { documentNumbering, DocumentType } from '@/config/document-numbering';
import { sql } from 'drizzle-orm';

export async function generateDocumentNumber(type: DocumentType) {
  const config = documentNumbering[type];
  let nextNumber = config.startNumber;

  // Query database for the last number
  let lastRecord;

  if (type === 'bastMasuk') {
    // For BAST Masuk, we need to extract the number part from the string
    // Format: 00722::BA1.00001
    // We can count records or try to parse the max value.
    // Counting is safer if we assume strict increment, but parsing is robust against deletions.
    // Let's rely on simple counting + 1 for now if we can't reliably parse mixed formats
    // Or simpler: Get Count
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bastMasuk);
    nextNumber = Number(result[0].count) + config.startNumber;
  } else if (type === 'spb') {
    // Current logic usually relies on ID or specific logic, implementing generic fallbacks
    const result = await db.select({ count: sql<number>`count(*)` }).from(spb);
    nextNumber = Number(result[0].count) + config.startNumber;
  } else if (type === 'sppb') {
    const result = await db.select({ count: sql<number>`count(*)` }).from(sppb);
    nextNumber = Number(result[0].count) + config.startNumber;
  } else if (type === 'bastKeluar') {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bastKeluar);
    nextNumber = Number(result[0].count) + config.startNumber;
  }

  // Generate Number String
  const numberStr = nextNumber.toString().padStart(config.numberPadding, '0');
  const year = new Date().getFullYear().toString();

  let formatted = config.format
    .replace('{year}', year)
    .replace('{number}', numberStr);

  return formatted;
}
