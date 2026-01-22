'use client';

import { useEffect } from 'react';

export function PrintStyles() {
  useEffect(() => {
    // Auto-trigger print
    window.print();
  }, []);

  return (
    <style jsx global>{`
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
      body {
        font-family: Arial, Helvetica, sans-serif;
      }
    `}</style>
  );
}
