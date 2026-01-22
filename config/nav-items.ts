import {
  LayoutDashboard,
  Package,
  Settings,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  ClipboardList,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  items?: {
    title: string;
    href: string;
  }[];
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventaris',
    href: '/dashboard/inventaris',
    icon: Package,
    items: [
      {
        title: 'Data Barang',
        href: '/dashboard/barang',
      },
      {
        title: 'Kategori',
        href: '/dashboard/kategori',
      },
      {
        title: 'Satuan',
        href: '/dashboard/satuan',
      },
    ],
  },
  {
    title: 'Transaksi Masuk',
    href: '/dashboard/transaksi-masuk',
    icon: ArrowDownToLine,
    items: [
      {
        title: 'BAST Masuk',
        href: '/dashboard/bast-masuk',
      },
      {
        title: 'Asal Pembelian',
        href: '/dashboard/asal-pembelian',
      },
      {
        title: 'Pihak Ketiga',
        href: '/dashboard/pihak-ketiga',
      },
      {
        title: 'Rekening',
        href: '/dashboard/rekening',
      },
    ],
  },
  {
    title: 'Transaksi Keluar',
    href: '/dashboard/transaksi-keluar',
    icon: ArrowUpFromLine,
    items: [
      {
        title: 'Surat Permintaan (SPB)',
        href: '/dashboard/spb',
      },
      {
        title: 'SPPB',
        href: '/dashboard/sppb',
      },
      {
        title: 'BAST Keluar',
        href: '/dashboard/bast-keluar',
      },
    ],
  },
  {
    title: 'Kepegawaian',
    href: '/dashboard/kepegawaian',
    icon: Users,
    items: [
      {
        title: 'Data Pegawai',
        href: '/dashboard/pegawai',
      },
      {
        title: 'Jabatan',
        href: '/dashboard/jabatan',
      },
      {
        title: 'Manajemen User',
        href: '/dashboard/users',
      },
    ],
  },
  {
    title: 'Laporan',
    href: '/dashboard/laporan',
    icon: ClipboardList,
    items: [
      {
        title: 'Mutasi Barang',
        href: '/dashboard/mutasi',
      },
      {
        title: 'Riwayat Harga',
        href: '/dashboard/riwayat-harga',
      },
    ],
  },
];
