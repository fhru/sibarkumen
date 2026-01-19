import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { UserTable } from './components/user-table';
import { UserStats } from './components/user-stats';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const data = await db.select().from(user).orderBy(desc(user.createdAt));

  const totalUsers = data.length;
  const bannedUsers = data.filter((u) => u.banned).length;
  const activeUsers = totalUsers - bannedUsers;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Kelola pengguna, role, dan status akun.
          </p>
        </div>
      </div>
      <UserStats
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        bannedUsers={bannedUsers}
      />
      <UserTable data={data} />
    </div>
  );
}
