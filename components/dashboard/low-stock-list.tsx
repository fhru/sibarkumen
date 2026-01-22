import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LowStockListProps {
  items: any[];
}

export function LowStockList({ items }: LowStockListProps) {
  return (
    <div className="flex bg-background flex-col rounded-lg border dark:bg-input/30">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          Stok Menipis
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Barang dengan stok kurang dari 5
        </p>
      </div>
      <div className="flex-1 p-0">
        <ScrollArea className="max-h-full">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Semua stok aman.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      title={item.nama}
                    >
                      {item.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.satuan?.nama || '-'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-rose-600">
                      {item.stok}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      Sisa
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="p-3 border-t bg-muted/10">
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/dashboard/barang">
            Kelola Stok <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
