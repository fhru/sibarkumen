'use client';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuratPermintaanPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Layout will handle redirect
  }

  // Access Control Check
  if (session.user.role?.toLowerCase() !== 'pegawai') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <Lock className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini
          khusus untuk pengguna dengan peran <strong>Pegawai</strong>.
        </p>
        <Link href="/dashboard">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Surat Permintaan Barang
        </h1>
        <Button>Buat Permintaan Baru</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Permintaan Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-lg">
            Belum ada data permintaan barang.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
