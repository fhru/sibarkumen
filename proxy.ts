import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { navItems, Role } from "./config/nav-items";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // Block sign-up for everyone
  if (pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 1. Jika BELUM login
  if (!session) {
    // Jika dia mencoba akses halaman selain /sign-in, lempar ke login
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  // 2. Jika SUDAH login
  if (session) {
    // Jika dia mencoba akses halaman login, lempar ke dashboard
    if (pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. Role-based access control for /dashboard routes
    if (pathname.startsWith("/dashboard")) {
      const userRole = (session.user.role as Role) || "petugas";

      // Check permissions based on navItems
      for (const item of navItems) {
        if (item.href !== "/dashboard" && pathname.startsWith(item.href)) {
          if (item.roles && !item.roles.includes(userRole)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }

        if (item.items) {
          for (const subItem of item.items) {
            if (pathname.startsWith(subItem.href)) {
              if (subItem.roles && !subItem.roles.includes(userRole)) {
                return NextResponse.redirect(
                  new URL("/dashboard", request.url),
                );
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
