import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Package } from "lucide-react";

import { Role } from "@/config/nav-items";

interface QuickActionsProps {
  role: Role;
}

export function QuickActions({ role }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {role !== "petugas" && (
        <Link href="/dashboard/barang" className="group">
          <div className="rounded-lg border bg-background dark:bg-input/30 p-4 transition-all hover:border-primary/50 hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Input Barang</p>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">
                  Tambah stok baru
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {role !== "petugas" && (
        <Link href="/dashboard/bast-masuk/create" className="group">
          <div className="rounded-lg border bg-background dark:bg-input/30 p-4 transition-all hover:border-primary/50 hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">BAST Masuk</p>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">
                  Catat penerimaan
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      <Link href="/dashboard/spb/create" className="group">
        <div className="rounded-lg border bg-background dark:bg-input/30 p-4 transition-all hover:border-primary/50 hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Buat SPB</p>
              <p className="text-xs text-muted-foreground group-hover:text-foreground">
                Permintaan barang
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
