"use client";

import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

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
  // Add Action to "View PDF" or "Details" eventually
];
