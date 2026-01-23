import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreHorizontal,
  Printer,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { toggleSPPBPrintStatus } from '@/drizzle/actions/sppb';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { Role } from '@/config/nav-items';

export type SPPB = {
  id: number;
  nomorSppb: string;
  tanggalSppb: string;
  spbId: number;
  pejabatPenyetujuId: number;
  diterimaOlehId: number;
  serahTerimaOlehId: number | null;
  keterangan: string | null;
  status: 'MENUNGGU_BAST' | 'SELESAI' | 'BATAL';
  isPrinted: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  spb: {
    id: number;
    nomorSpb: string;
    tanggalSpb: string;
  } | null;
  pejabatPenyetuju: {
    id: number;
    nama: string;
    nip: string | null;
  } | null;
  diterimaOleh: {
    id: number;
    nama: string;
    nip: string | null;
  } | null;
  serahTerimaOleh: {
    id: number;
    nama: string;
    nip: string | null;
  } | null;
};

// Sortable Header Component to reuse
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
    if (currentSortOrder === 'asc') {
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

const SPPBActionCell = ({ row }: { row: { original: SPPB } }) => {
  const router = useRouter();
  const session = authClient.useSession();
  const userRole = session.data?.user.role as Role | undefined;

  const handlePrintToggle = async () => {
    try {
      const result = await toggleSPPBPrintStatus(row.original.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Gagal mengubah status cetak');
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
          onSelect={() => router.push(`/dashboard/sppb/${row.original.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Lihat Detail
        </DropdownMenuItem>

        {row.original.status === 'MENUNGGU_BAST' &&
          userRole !== 'supervisor' && (
            <DropdownMenuItem
              onSelect={() =>
                router.push(
                  `/dashboard/bast-keluar/create?sppbId=${row.original.id}`
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat BAST
            </DropdownMenuItem>
          )}
        <DropdownMenuItem
          onSelect={() => {
            window.open(`/print/sppb/${row.original.id}`, '_blank');
          }}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print SPPB
        </DropdownMenuItem>

        {userRole !== 'supervisor' && (
          <DropdownMenuItem onSelect={handlePrintToggle}>
            {row.original.isPrinted ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Tandai Belum Dicetak
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Tandai Sudah Dicetak
              </>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createColumns = (
  currentSortBy: string,
  currentSortOrder: string,
  onSort: (columnId: string) => void
): ColumnDef<SPPB>[] => [
  {
    accessorKey: 'nomorSppb',
    header: () => (
      <SortableHeader
        columnId="nomorSppb"
        title="Nomor SPPB"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/sppb/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue('nomorSppb')}
      </Link>
    ),
  },
  {
    accessorKey: 'tanggalSppb',
    header: () => (
      <SortableHeader
        columnId="tanggalSppb"
        title="Tanggal"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue('tanggalSppb')), 'dd MMM yyyy', {
        locale: localeId,
      }),
  },
  {
    id: 'spb',
    header: 'Nomor SPB',
    cell: ({ row }) => {
      const spb = row.original.spb;
      return spb ? (
        <Link
          href={`/dashboard/spb/${spb.id}`}
          className="text-primary hover:underline hover:text-primary/80"
        >
          {spb.nomorSpb}
        </Link>
      ) : (
        '-'
      );
    },
  },
  {
    id: 'pejabat',
    header: 'Pejabat Penyetuju',
    cell: ({ row }) => row.original.pejabatPenyetuju?.nama || '-',
  },
  {
    id: 'penerima',
    header: 'Diterima Oleh',
    cell: ({ row }) => row.original.diterimaOleh?.nama || '-',
  },
  {
    id: 'status',
    header: () => (
      <SortableHeader
        columnId="status"
        title="Status"
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      let badgeVariant = 'secondary';
      let badgeClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      let label: string = status;

      switch (status) {
        case 'MENUNGGU_BAST':
          badgeVariant = 'secondary';
          badgeClass =
            'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
          label = 'Menunggu BAST';
          break;
        case 'SELESAI':
          badgeVariant = 'secondary';
          badgeClass =
            'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400';
          label = 'Selesai';
          break;
        case 'BATAL':
          badgeVariant = 'destructive';
          badgeClass =
            'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400';
          label = 'Batal';
          break;
      }

      return (
        <Badge variant={badgeVariant as any} className={badgeClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: 'isPrinted',
    header: 'Dicetak',
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
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => {
      const keterangan = row.getValue('keterangan') as string | null;
      return keterangan ? (
        <span className="text-sm text-muted-foreground">{keterangan}</span>
      ) : (
        '-'
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <SPPBActionCell row={row} />,
  },
];
