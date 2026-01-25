import { fetchArsipDocuments, fetchArsipStats } from "@/drizzle/actions/arsip";
import { ArsipTable } from "./components/arsip-table";
import { columns } from "./components/arsip-table-columns";
import { ArsipStats } from "./components/arsip-stats";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arsip Dokumen | Sibarkumen",
  description: "Daftar semua dokumen arsip (BAST, SPB, SPPB, Stock Opname)",
};

export const dynamic = "force-dynamic";

export default async function ArsipPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const { search, type } = await searchParams;

  const searchQuery = typeof search === "string" ? search : "";
  const typeFilter = typeof type === "string" ? type : undefined;

  const [data, stats] = await Promise.all([
    fetchArsipDocuments(searchQuery, typeFilter),
    fetchArsipStats(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Arsip Dokumen</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Arsip Dokumen</h2>
          <p className="text-muted-foreground">
            Daftar semua dokumen yang telah dibuat dalam sistem.
          </p>
        </div>
      </div>

      {/* 3. Table */}
      <div className="flex h-full flex-1 flex-col space-y-6">
        <ArsipStats stats={stats} />
        <Suspense fallback={<div>Loading table...</div>}>
          <ArsipTable columns={columns} data={data} />
        </Suspense>
      </div>
    </div>
  );
}
