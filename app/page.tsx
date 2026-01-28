import Link from "next/link";
import Image from "next/image";
import LightRays from "@/components/ui/light-rays";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
      {/* Background Rays */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={false}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="opacity-40"
        />
      </div>

      {/* Floating Glass Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg">
        <div className="flex px-6 h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="Sibarkumen Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold tracking-tight text-lg">Sibarkumen</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  variant="secondary"
                  className="px-6 shadow-sm hover:shadow-md transition-all"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button
                  size="sm"
                  variant="secondary"
                  className="px-6 shadow-sm hover:shadow-md transition-all"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 px-4 text-center mt-20">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-20 w-20 md:h-28 md:w-28">
              <Image
                src="/logo_jaktim.png"
                alt="Logo Kota Administrasi Jakarta Timur"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/*<div className="inline-block px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              Sistem Inventaris Barang
            </div>*/}
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/50 pb-2">
              Sibarkumen
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-xl text-muted-foreground md:text-2xl leading-relaxed">
            Aplikasi internal untuk mempermudah pencatatan barang masuk, barang
            keluar, dan pelaporan stok gudang di Kantor Kelurahan Ujung Menteng.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-lg shadow-primary/20"
                >
                  Ke Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-lg shadow-primary/20"
                >
                  Masuk ke Sistem <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground/60">
        <p>
          &copy; {new Date().getFullYear()} Kelurahan Ujung Menteng.{" "}
          <br className="sm:hidden" />
          Dikembangkan oleh{" "}
          <Link href={"/our-team"} className="underline">
            Mahasiswa Gunadarma.
          </Link>
        </p>
      </footer>
    </div>
  );
}
