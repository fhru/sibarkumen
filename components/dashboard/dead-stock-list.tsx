import { Archive, AlertCircle } from 'lucide-react';

interface DeadStockListProps {
  items: any[];
}

export function DeadStockList({ items }: DeadStockListProps) {
  return (
    <div className="rounded-lg border bg-background dark:bg-input/30 p-4">
      <h3 className="flex items-center gap-2 font-semibold">
        <Archive className="h-4 w-4 text-muted-foreground" />
        Barang Mati ({'>'}90 Hari)
      </h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Tidak ada barang mati.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium truncate" title={item.nama}>
                  {item.nama}
                </p>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Tidak bergerak
                  </span>
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <span className="text-sm font-bold">{item.stok}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {item.satuan}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
