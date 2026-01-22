'use server';

import { db } from '@/lib/db';
import { pihakKetiga } from '@/drizzle/schema';
import { ilike } from 'drizzle-orm';

export async function searchPihakKetiga(query: string) {
  const result = await db
    .select({
      id: pihakKetiga.id,
      nama: pihakKetiga.nama,
    })
    .from(pihakKetiga)
    .where(ilike(pihakKetiga.nama, `%${query}%`))
    .limit(20);

  return result;
}
