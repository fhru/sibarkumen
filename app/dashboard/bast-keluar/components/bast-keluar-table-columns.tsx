"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreHorizontal,
  Printer,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleBastKeluarPrintStatus } from "@/drizzle/actions/bast-keluar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export type BastKeluar = {
  id: number;
  nomorBast: string;
  tanggalBast: string;
  sppbId: number;
  subtotal: string;
  totalPpn: string;
  grandTotal: string;
  isPrinted: boolean;
  sppb: { id: number; nomorSppb: string } | null;
  pihakPertama: { nama: string } | null;
  pihakKedua: { nama: string } | null;
};

// Sortable Header Component
const SortableHeader = ({
  columnId,
  title,
  currentSortBy,
  currentSortOrder,
  onSort,
}: {
  columnId: string;
  title: string;
  currentSortBy: string;
  currentSortOrder: string;
  onSort: (columnId: string) => void;
}) => {
  const getSortIcon = () => {
    if (currentSortBy !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (currentSortOrder === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(columnId)}
      className="h-8 px-2"
    >
      {title}
      {getSortIcon()}
    </Button>
  );
};

const BastKeluarActionCell = ({ row }: { row: { original: BastKeluar } }) => {
  const router = useRouter();

  const handlePrintToggle = async () => {
    try {
      const result = await toggleBastKeluarPrintStatus(row.original.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal mengubah status cetak");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() =>
            router.push(`/dashboard/bast-keluar/${row.original.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          Lihat Detail
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            window.open(`/print/bast-keluar/${row.original.id}`, "_blank");
          }}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print BAST
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={handlePrintToggle}>
          {row.original.isPrinted ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Tandai Belum Dicetak
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Tandai Sudah Dicetak
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createColumns = (
  currentSortBy: string,
  currentSortOrder: string,
  onSort: (columnId: string) => void,
): ColumnDef<BastKeluar>[] => [
  {
    accessorKey: "nomorBast",
    header: () => (
      <SortableHeader
        columnId="nomorBast"
        title="Nomor BAST"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/bast-keluar/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("nomorBast")}
      </Link>
    ),
  },
  {
    accessorKey: "tanggalBast",
    header: () => (
      <SortableHeader
        columnId="tanggalBast"
        title="Tanggal"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("tanggalBast")), "dd MMM yyyy", {
        locale: localeId,
      }),
  },
  {
    accessorKey: "sppb",
    header: "Nomor SPPB",
    cell: ({ row }) => {
      const sppb = row.original.sppb;
      return sppb ? (
        <Link
          href={`/dashboard/sppb/${sppb.id}`}
          className="text-primary hover:underline hover:text-primary/80"
        >
          {sppb.nomorSppb}
        </Link>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "pihakPertama",
    header: "Pihak Pertama",
    cell: ({ row }) => row.original.pihakPertama?.nama || "-",
  },
  {
    accessorKey: "pihakKedua",
    header: "Pihak Kedua",
    cell: ({ row }) => row.original.pihakKedua?.nama || "-",
  },
  {
    accessorKey: "grandTotal",
    header: () => <div className="text-right">Grand Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        Rp {parseFloat(row.getValue("grandTotal")).toLocaleString("id-ID")}
      </div>
    ),
  },
  {
    accessorKey: "isPrinted",
    header: "Dicetak",
    cell: ({ row }) => {
      const isPrinted = row.original.isPrinted;
      return isPrinted ? (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
        >
          Sudah
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          Belum
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <BastKeluarActionCell row={row} />,
  },
];
