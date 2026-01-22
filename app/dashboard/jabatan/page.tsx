import { db } from "@/lib/db";
import { jabatan } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { JabatanTable } from "./components/jabatan-table";
import { JabatanStats } from "./components/jabatan-stats";
import { JabatanDialogCreate } from "./components/jabatan-dialog-create";
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
  title: "Jabatan | Sibarkumen",
  description: "Kelola daftar jabatan di sini.",
};

export default async function JabatanPage() {
  const data = await db.select().from(jabatan).orderBy(desc(jabatan.id));

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Jabatan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jabatan</h2>
          <p className="text-muted-foreground">
            Kelola daftar jabatan di sini.
          </p>
        </div>
        <JabatanDialogCreate />
      </div>

      <JabatanStats totalJabatan={data.length} />
      <JabatanTable data={data} />
    </div>
  );
}
