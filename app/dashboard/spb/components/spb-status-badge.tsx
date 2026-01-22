import { Badge } from '@/components/ui/badge';

interface SPBStatusBadgeProps {
  status: string; // Using string to allow flexibility, but practically limited to SPB statuses
}

export function SPBStatusBadge({ status }: SPBStatusBadgeProps) {
  switch (status) {
    case 'MENUNGGU_SPPB':
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
        >
          Menunggu SPPB
        </Badge>
      );
    case 'SELESAI':
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
        >
          Selesai
        </Badge>
      );
    case 'BATAL':
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
        >
          Batal
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
