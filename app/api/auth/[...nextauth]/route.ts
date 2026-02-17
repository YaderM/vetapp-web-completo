import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// URL base: En producción usa la variable de entorno, en local usa localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// Configuración de NextAuth
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Validación básica
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

                    if (!response.ok) return null;

                    const apiData = await response.json();
                    
                    // --- CORRECCIÓN AQUÍ ---
                    // Tu backend envía los datos directamente en apiData (id, nombre, email, token)
                    // No vienen dentro de un objeto .usuario o .user
                    if (!apiData.id || !apiData.token) {
                        console.error("El backend no devolvió ID o Token correctamente");
                        return null;
                    }

                    return {
                        id: String(apiData.id),
                        email: apiData.email,
                        name: apiData.nombre,
                        token: apiData.token,
                    } as any;
                    // --- FIN DE LA CORRECCIÓN ---

                } catch (error) {
                    console.error("Error Auth:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return { ...token, ...user };
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token as any;
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };