import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="rounded-md border">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 flex-1 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {[...Array(columns)].map((_, colIndex) => (
              <div key={colIndex} className="h-4 flex-1 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="h-9 w-48 bg-muted animate-pulse rounded" />
      <div className="h-10 w-32 bg-muted animate-pulse rounded" />
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-10 w-80 bg-muted animate-pulse rounded" />
    </div>
  );
}

export function FullPageSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <PageHeaderSkeleton />
      <SearchSkeleton />
      <TableSkeleton rows={rows} columns={columns} />
    </div>
  );
}
