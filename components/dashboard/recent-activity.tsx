import Link from 'next/link';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentActivityProps {
  activities: any[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-lg border bg-background dark:bg-input/30">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Aktivitas Terkini</h3>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
          <Link href="/dashboard/mutasi">Lihat Semua</Link>
        </Button>
      </div>
      <div>
        {activities.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 overflow-hidden">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      item.jenisMutasi === 'MASUK'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : item.jenisMutasi === 'KELUAR'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                          : 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                    }`}
                  >
                    {item.jenisMutasi === 'MASUK' ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : item.jenisMutasi === 'KELUAR' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <History className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate">
                      {item.barang.nama}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(item.tanggal), 'dd MMM HH:mm', {
                          locale: localeId,
                        })}
                      </span>
                      {item.referensiId && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline font-mono bg-muted px-1 rounded">
                            {item.referensiId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p
                    className={`text-sm font-bold ${
                      item.jenisMutasi === 'MASUK'
                        ? 'text-emerald-600'
                        : item.jenisMutasi === 'KELUAR'
                          ? 'text-rose-600'
                          : 'text-orange-600'
                    }`}
                  >
                    {item.jenisMutasi === 'MASUK'
                      ? '+'
                      : item.jenisMutasi === 'KELUAR'
                        ? '-'
                        : item.jenisMutasi === 'PENYESUAIAN'
                          ? item.qtyMasuk > 0
                            ? '+'
                            : '-'
                          : ''}
                    {item.jenisMutasi === 'MASUK'
                      ? item.qtyMasuk
                      : item.jenisMutasi === 'KELUAR'
                        ? item.qtyKeluar
                        : item.jenisMutasi === 'PENYESUAIAN'
                          ? Math.max(item.qtyMasuk, item.qtyKeluar)
                          : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {item.jenisMutasi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
