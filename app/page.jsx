import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, ArrowRight, Box } from 'lucide-react';
import config from '../app.config.json';
import { ModeToggle } from '@/components/theme/mode-toggle';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-24">
      {/* Background Effects */}
      <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Badge/Label */}
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="mr-2 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          v{config.site.version} Public Release
        </div>

        {/* Hero Title */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl">
          <span className="bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            {config.site.name}
          </span>
        </h1>

        {/* Hero Description */}
        <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {config.site.description}. Platform manajemen aset modern yang cepat,
          efisien, dan terintegrasi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 min-w-[200px] gap-2 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30"
            >
              <ShieldCheck className="h-5 w-5" />
              Login ke Sistem
            </Button>
          </Link>
          <ModeToggle />
        </div>

        {/* Feature Grid (Decorative) */}
        <div className="mt-20 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
          <div className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-card/80">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all">
              <Box className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold">Manajemen Aset</h3>
            <p className="text-sm text-muted-foreground">
              Pelacakan barang masuk dan keluar dengan akurasi tinggi.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-card/80">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold">Keamanan Data</h3>
            <p className="text-sm text-muted-foreground">
              Sistem otentikasi bertingkat untuk keamanan maksimal.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-card/80">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all">
              <ArrowRight className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold">Real-time Update</h3>
            <p className="text-sm text-muted-foreground">
              Pemantauan status inventaris secara langsung dan akurat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
