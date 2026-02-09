// app/api/auth/[...nextauth]/route.ts
// Este archivo configura cómo NextAuth interactúa con tu API REST de autenticación.

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User as NextAuthUser } from "next-auth"; // Renombramos User para evitar conflictos

// --- 1. Definición de Tipos de Usuario (Ajustar según tu API) ---
interface CustomUser extends NextAuthUser {
  id: string;
  email: string;
  nombre: string;
  token: string; // Es crucial guardar el token JWT de la API REST aquí
}

// --- 2. Función para Autenticación (Consumo de la API REST) ---
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      // Esta es la función CLAVE: Aquí se consume la API REST.
      async authorize(credentials, req) {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/login';

        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          // Manejo de errores de la API
          if (!response.ok) {
            const error = await response.json();
            console.error("API Login Error:", error);
            // Si la API devuelve un error de credenciales, retornamos null
            return null; 
          }

          const apiData = await response.json();
          
          // La API REST debe devolver el token y los datos del usuario.
          const user: CustomUser = {
            id: apiData.id || apiData.user.id,
            email: apiData.email || apiData.user.email,
            nombre: apiData.nombre || apiData.user.nombre,
            token: apiData.token, // Guardamos el token para futuras llamadas a la API
          };
          
          // Si es exitoso, retornamos el objeto user.
          return user;

        } catch (error) {
          console.error("Fetch/Connection Error:", error);
          return null;
        }
      }
    })
  ],
  
  // --- 3. Callbacks para Persistir la Sesión ---
  callbacks: {
    // Almacena datos personalizados (el token) en el token JWT de NextAuth
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nombre = user.nombre;
        token.token = user.token; // Persiste el token de la API REST
      }
      return token;
    },
    
    // Hace que los datos del token JWT sean accesibles en la sesión del cliente
    async session({ session, token }: { session: any, token: any }) {
      session.user = {
        id: token.id,
        email: token.email,
        nombre: token.nombre,
        token: token.token, // El token estará disponible aquí para tus servicios (Axios/fetch)
      };
      return session;
    }
  },
  
  // Configuraciones adicionales
  pages: {
    signIn: '/login',
    error: '/login', 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };