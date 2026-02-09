// auth/auth.ts
import NextAuth, { type NextAuthOptions, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL; 

// --- 1. Definición de Tipos ---
declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            nombre: string;
            email: string;
            token: string; // Token de la API Express
        } & DefaultSession["user"];
    }
}

// --- 2. Definición y EXPORTACIÓN de las Opciones ---
export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            
            async authorize(credentials: any) {
                const email = credentials.email as string;
                const password = credentials.password as string;
                if (!email || !password) return null;

                try {
                    const res = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!res.ok) { 
                        console.error("NextAuth Authorize: API devolvió error de credenciales.");
                        return null; 
                    }
                    
                    const apiData = await res.json();

                    // Comprobamos que el token exista
                    if (apiData && apiData.token) {
                        const user = {
                            id: apiData.id,
                            email: apiData.email,
                            nombre: apiData.nombre,
                            token: apiData.token,
                        };
                        return user; // ¡Éxito!
                    } else {
                        console.error("NextAuth Authorize: Respuesta JSON inesperada (no se encontró 'token').");
                        return null;
                    }

                } catch (error) {
                    console.error("Error en NextAuth Authorize (fetch falló):", error);
                    return null;
                }
            },
        }),
    ],
    // Callbacks 
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.nombre = user.nombre;
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.id as number;
                session.user.email = token.email as string;
                session.user.nombre = token.nombre as string;
                session.user.token = token.token as string;
            }
            return session;
        },
    },
    session: { strategy: "jwt" },

    // ----- ¡LA CORRECCIÓN FINAL ESTÁ AQUÍ! -----
    // Apuntamos a la página de login real (/login)
    pages: { 
        signIn: '/login',
        error: '/login', // Si hay error, vuelve al login
    }, 
    // ----- FIN DE LA CORRECCIÓN -----

    secret: process.env.NEXTAUTH_SECRET,
};

// --- 3. EXPORTACIÓN de funciones auxiliares ---
export const { auth, signIn, signOut } = NextAuth(authOptions);