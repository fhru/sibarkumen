import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 p-2 lg:p-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`stat-${index}`}
                className="rounded-lg border bg-background dark:bg-input/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`action-${index}`}
                className="rounded-lg border bg-background dark:bg-input/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-lg border bg-background dark:bg-input/30 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-9 w-[150px]" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </section>

          <section className="rounded-lg border bg-background dark:bg-input/30 p-6 space-y-4">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`activity-${index}`} className="h-6 w-full" />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <section
              key={`side-${index}`}
              className="rounded-lg border bg-background dark:bg-input/30 p-6 space-y-4"
            >
              <Skeleton className="h-4 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <Skeleton
                    key={`side-${index}-row-${rowIndex}`}
                    className="h-3 w-full"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
