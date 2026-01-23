import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { pegawai } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Role } from '@/config/nav-items';

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function getCurrentPegawai() {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await db.query.pegawai.findFirst({
    where: eq(pegawai.userId, user.id),
  });

  return data;
}

export async function checkRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = (user.role as Role) || 'petugas';
  return allowedRoles.includes(role);
}
