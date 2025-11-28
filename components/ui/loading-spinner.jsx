import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className, ...props }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={`h-10 w-10 animate-spin text-primary ${className}`}
        {...props}
      />
      <p className="text-sm text-muted-foreground animate-pulse">Loading data...</p>
    </div>
  );
}
