import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 1. Define las rutas que DEBEN estar protegidas (requieren autenticación)
const protectedRoutes = [
  "/dashboard",
  "/propietarios",
  "/propietarios/crear",
  "/propietarios/editar",
  "/pacientes-listado", // Usando tu nombre de carpeta
  "/pacientes-crear",   // Usando tu nombre de carpeta
  "/pacientes-ficha",   // Usando tu nombre de carpeta
  "/perfil",
  // Se debe proteger cualquier ruta que no sea /login o /register
];

// 2. Exporta el middleware de NextAuth envuelto en tu lógica
export default withAuth(
  // La función principal del middleware
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    
    // Si el usuario intenta acceder a una ruta protegida sin un token:
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtected && !token) {
        // Redirige al login si no hay token (aunque withAuth ya lo maneja)
        return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Si el usuario SÍ tiene un token y está intentando acceder a /login, lo redirigimos al dashboard
    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Continúa con la solicitud normal
    return NextResponse.next();
  },
  {
    // 3. Configuración para NextAuth
    callbacks: {
      // Solo permite la ejecución del middleware si el token JWT es válido
      authorized: ({ token }) => !!token, 
    },
    
    // Rutas a las que se redirige si la autorización falla
    pages: {
      signIn: "/login",
    },
  }
);

// 4. Configuración del matcher (rutas a las que se aplica el middleware)
export const config = {
  // Se aplica a todas las rutas excepto las estáticas (_next, favicon) y las API routes.
  matcher: [
    "/dashboard/:path*",
    "/propietarios/:path*",
    "/pacientes-listado/:path*",
    "/pacientes-crear/:path*",
    "/pacientes-ficha/:path*",
    "/perfil",
    "/login",
  ],
};
