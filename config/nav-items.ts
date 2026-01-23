import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  FileText,
  Settings,
} from 'lucide-react';

export type Role = 'admin' | 'supervisor' | 'petugas';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: Role[]; // If undefined, accessible by all
  items?: {
    title: string;
    href: string;
    roles?: Role[];
  }[];
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'supervisor'],
  },
  {
    title: 'Inventaris',
    href: '/dashboard/inventaris',
    icon: Package,
    roles: ['admin', 'supervisor'],
    items: [
      {
        title: 'Data Barang',
        href: '/dashboard/barang',
      },
      {
        title: 'Stock Opname',
        href: '/dashboard/stock-opname',
      },
      {
        title: 'Mutasi Barang',
        href: '/dashboard/mutasi',
      },
    ],
  },
  {
    title: 'Transaksi',
    href: '/dashboard/transaksi',
    icon: ArrowRightLeft,
    items: [
      {
        title: 'BAST Masuk',
        href: '/dashboard/bast-masuk',
        roles: ['admin', 'supervisor'],
      },
      {
        title: 'Permintaan Barang (SPB)',
        href: '/dashboard/spb',
      },
      {
        title: 'Persetujuan (SPPB)',
        href: '/dashboard/sppb',
        roles: ['admin', 'supervisor'],
      },
      {
        title: 'BAST Keluar',
        href: '/dashboard/bast-keluar',
        roles: ['admin', 'supervisor'],
      },
    ],
  },
  {
    title: 'Laporan',
    href: '/dashboard/laporan',
    icon: FileText,
    roles: ['admin', 'supervisor'],
    items: [
      {
        title: 'Arsip Dokumen',
        href: '/dashboard/arsip',
      },
      {
        title: 'Riwayat Harga',
        href: '/dashboard/riwayat-harga',
      },
    ],
  },
  {
    title: 'Data Master',
    href: '/dashboard/master',
    icon: Settings,
    roles: ['admin'],
    items: [
      {
        title: 'Kategori',
        href: '/dashboard/kategori',
      },
      {
        title: 'Satuan',
        href: '/dashboard/satuan',
      },
      {
        title: 'Data Pegawai',
        href: '/dashboard/pegawai',
      },
      {
        title: 'Jabatan',
        href: '/dashboard/jabatan',
      },
      {
        title: 'Pihak Ketiga',
        href: '/dashboard/pihak-ketiga',
      },
      {
        title: 'Asal Pembelian',
        href: '/dashboard/asal-pembelian',
      },
      {
        title: 'Kode Rekening',
        href: '/dashboard/kode-rekening',
      },
      {
        title: 'Manajemen User',
        href: '/dashboard/users',
      },
    ],
  },
];
