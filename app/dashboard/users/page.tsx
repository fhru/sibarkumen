import { db } from "@/lib/db";
import { user } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { UserTable } from "./components/user-table";
import { UserStats } from "./components/user-stats";
import { UserDialogCreate } from "./components/user-dialog-create";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users | Sibarkumen",
  description: "Kelola pengguna, role, dan status akun",
};

export default async function UsersPage() {
  const data = await db.select().from(user).orderBy(desc(user.createdAt));

  const totalUsers = data.length;
  const bannedUsers = data.filter((u) => u.banned).length;
  const activeUsers = totalUsers - bannedUsers;

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manajemen User</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
          <p className="text-muted-foreground">
            Kelola pengguna, role, dan status akun.
          </p>
        </div>
        <UserDialogCreate />
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
