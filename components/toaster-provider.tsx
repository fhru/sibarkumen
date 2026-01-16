'use client';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ToasterProvider() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <SonnerToaster
      richColors
      position="bottom-center"
      theme={(resolvedTheme ?? 'system') as ToasterProps['theme']}
    />
  );
}
