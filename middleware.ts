import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ["/", "/login", "/registro"];
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Si está en /registro/completar, permitir
    if (pathname === "/registro/completar") {
      return NextResponse.next();
    }

    // Si el usuario no completó su registro y no está en la página de completar
    if (token && token.registro_completo === false) {
      const url = new URL("/registro/completar", req.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Rutas públicas siempre permitidas
        const publicRoutes = ["/", "/login", "/registro", "/registro/completar"];
        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // Para rutas protegidas, requiere token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logos|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
