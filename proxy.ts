import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = request.nextUrl;

  // Blokir /sign-up (Hapus permanen akses ke sana)
  // if (pathname === '/sign-up') {
  //   return NextResponse.redirect(new URL('/sign-in', request.url));
  // }

  // Jika BELUM login
  if (!session) {
    // Jika dia mencoba akses halaman selain /sign-in, lempar ke login
    if (pathname !== '/sign-in') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    // Jika dia memang sedang di /sign-in, biarkan lewat (NextResponse.next)
    return NextResponse.next();
  }

  // Jika SUDAH login
  if (session) {
    // Jika dia mencoba akses halaman login, lempar ke dashboard
    if (pathname === '/sign-in') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Update Matcher agar menangkap semua sub-route dashboard
export const config = {
  matcher: ['/dashboard/:path*', '/sign-in'],
};
