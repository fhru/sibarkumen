'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-slate-200 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/50 dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 mb-4">
            <Image
              src="/logo.png"
              alt="Sibarkumen Logo"
              fill
              className="object-contain"
            />
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Lock className="mr-2 h-3 w-3" />
            Internal Portal Restricted
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Sibarkumen</h1>
          <p className="text-muted-foreground">
            Sistem Informasi Inventaris Barang dan Surat Kelurahan Ujung
            Menteng.
          </p>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">
            Aplikasi ini bersifat internal dan hanya dapat diakses oleh pegawai
            yang terdaftar. Silakan login untuk melanjutkan.
          </p>
          <Link href="/sign-in" className="w-full block">
            <Button className="w-full" size="lg">
              Login Pegawai
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Kelurahan Ujung Menteng. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
