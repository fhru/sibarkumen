import { Suspense } from "react";
import {
  getRiwayatHarga,
  getRiwayatHargaStats,
} from "@/drizzle/actions/riwayat-harga";
import { RiwayatHargaTable } from "./components/riwayat-harga-table";
import { RiwayatHargaStats } from "./components/riwayat-harga-stats";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = {
  title: "Riwayat Harga | Sibarkumen",
  description: "Daftar riwayat harga barang berdasarkan BAST Masuk.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    pihakKetiga?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function RiwayatHargaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search;
  const sortBy = params.sortBy || "bastMasuk.tanggalBast";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const pihakKetigaId = params.pihakKetiga
    ? Number(params.pihakKetiga)
    : undefined;
  const startDate = params.startDate ? new Date(params.startDate) : undefined;
  const endDate = params.endDate ? new Date(params.endDate) : undefined;

  const [result, stats] = await Promise.all([
    getRiwayatHarga(
      page,
      25,
      search,
      sortBy,
      sortOrder,
      pihakKetigaId,
      startDate,
      endDate,
    ),
    getRiwayatHargaStats(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Riwayat Harga</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Harga</h2>
          <p className="text-muted-foreground">
            Daftar riwayat harga barang berdasarkan BAST Masuk.
          </p>
        </div>
      </div>

      <RiwayatHargaStats stats={stats} />

      <div className="flex h-full flex-1 flex-col space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RiwayatHargaTable
            data={result.data}
            pageCount={result.meta?.pageCount ?? 1}
            totalItems={result.meta?.total ?? 0}
          />
        </Suspense>
      </div>
    </div>
  );
}
