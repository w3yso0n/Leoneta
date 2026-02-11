import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/registro", "/auth/callback"];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Public routes — always allow
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next();
  }

  // Allow /registro/completar
  if (pathname === "/registro/completar") {
    return NextResponse.next();
  }

  // For protected routes, check for token in localStorage is not possible in middleware,
  // so we rely on the client-side AuthGuard component for redirection.
  // The middleware just lets requests through — the AuthGuard in dashboard/layout.tsx
  // will redirect unauthenticated users to /login.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logos|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
