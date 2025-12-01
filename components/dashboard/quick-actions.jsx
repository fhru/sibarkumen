'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PlusCircle, 
  FileText,
  Users,
  CreditCard
} from 'lucide-react';

const actions = [
  {
    title: 'Buat SPB',
    href: '/dashboard/spb/create',
    icon: FileText,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    title: 'Input BAST Masuk',
    href: '/dashboard/bast-masuk/create',
    icon: ArrowDownCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    title: 'Proses SPPB',
    href: '/dashboard/sppb/create',
    icon: ArrowUpCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'Tambah Barang',
    href: '/dashboard/barang', // Redirect to list first usually better, or direct modal if supported
    icon: PlusCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    title: 'Data Pegawai',
    href: '/dashboard/pegawai',
    icon: Users,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    title: 'Rekening',
    href: '/dashboard/rekening',
    icon: CreditCard,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  }
];

export function QuickActions() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={index} 
            href={action.href}
            className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors hover:scale-105 duration-200 text-center gap-2 group"
          >
            <div className={`p-3 rounded-full ${action.bgColor} group-hover:bg-background transition-colors`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {action.title}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
