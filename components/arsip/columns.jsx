"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";

// Mapping type ke doctype untuk URL print
const getDocType = (type) => {
  const map = {
    BAST_MASUK: "bast-masuk",
    SPB: "spb",
    SPPB: "sppb",
    BAST_KELUAR: "bast-keluar",
  };
  return map[type] || type.toLowerCase();
};

export const columns = [
  {
    accessorKey: "type",
    header: "Jenis Dokumen",
    cell: ({ row }) => {
      const type = row.getValue("type");
      let color = "default";
      let label = type;

      switch (type) {
        case "BAST_MASUK":
          color = "bg-green-100 text-green-800 hover:bg-green-100";
          label = "BAST Masuk";
          break;
        case "SPB":
          color = "bg-orange-100 text-orange-800 hover:bg-orange-100";
          label = "SPB";
          break;
        case "SPPB":
          color = "bg-blue-100 text-blue-800 hover:bg-blue-100";
          label = "SPPB";
          break;
        case "BAST_KELUAR":
          color = "bg-purple-100 text-purple-800 hover:bg-purple-100";
          label = "BAST Keluar";
          break;
      }

      return (
        <Badge className={color} variant="secondary">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "number",
    header: "Nomor Dokumen",
  },
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString("id-ID");
    },
  },
  {
    accessorKey: "actor",
    header: "Terkait / Aktor",
  },
  {
    accessorKey: "description",
    header: "Keterangan",
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const docType = getDocType(row.original.type);
      const docId = row.original.id;

      return (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/print/${docType}/${docId}`} target="_blank">
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Link>
        </Button>
      );
    },
  },
];
