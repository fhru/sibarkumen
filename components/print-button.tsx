'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <div className="fixed top-4 right-4 print:hidden z-50">
      <button
        onClick={() => typeof window !== 'undefined' && window.print()}
        className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 transition-colors"
      >
        <Printer className="h-4 w-4" />
        Print Document
      </button>
    </div>
  );
}
