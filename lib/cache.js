import { cache } from 'react';
import { auth } from '@/auth';

// Deduplicate auth calls within a single request
export const getSession = cache(async () => {
  return await auth();
});

// Generic cache wrapper factory
export function createCachedFetcher(fetcher) {
  return cache(fetcher);
}
