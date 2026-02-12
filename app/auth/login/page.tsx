import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- 1. Definición de Tipos ---
interface CustomUser {
  id: string;
  email: string;
  nombre: string;
  token: string;
}

// URL base: En producción usa la variable de entorno, en local usa localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// --- 2. Configuración de NextAuth ---
// IMPORTANTE: Exportamos authOptions para poder usarlo en getServerSession (Componentes de Servidor)
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 1. Validar que existan credenciales
                if (!credentials?.email || !credentials?.password) return null;

                const LOGIN_URL = `${API_BASE_URL}/auth/login`;

                try {
                    const response = await fetch(LOGIN_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!response.ok) {
                        console.error("Error Login API:", response.statusText);
                        return null;
                    }

                    const apiData = await response.json();
                    
                    // Ajusta esto según lo que devuelva tu backend (apiData.usuario o apiData.user)
                    const backendUser = apiData.usuario || apiData.user;

                    if (!backendUser || !apiData.token) {
                        return null;
                    }

                    // 2. Retornar el objeto de usuario mapeado
                    return {
                        id: String(backendUser.id),
                        email: backendUser.email,
                        name: backendUser.nombre, // NextAuth usa 'name' por defecto
                        nombre: backendUser.nombre, // Mantenemos tu propiedad personalizada
                        token: apiData.token,
                    } as any; // 'as any' para evitar conflictos estrictos de tipos de NextAuth

                } catch (error) {
                    console.error("Error de conexión (Auth):", error);
                    return null;
                }
            }
        })
    ],
    
    // --- 3. Callbacks ---
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Pasamos los datos del login inicial al token JWT interno
                return {
                    ...token,
                    id: (user as any).id,
                    nombre: (user as any).nombre,
                    token: (user as any).token,
                };
            }
            return token;
        },
        
        async session({ session, token }) {
            // Pasamos los datos del token a la sesión del cliente
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    nombre: token.nombre,
                    token: token.token,
                }
            };
        }
    },
    
    pages: {
        signIn: '/auth/login', // Asegúrate de que esta ruta sea la correcta (tu carpeta se llama auth/login)
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET, // ¡Recuerda configurar esto en Render!
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
