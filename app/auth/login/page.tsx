// app/api/auth/[...nextauth]/route.ts
// Este archivo configura cómo NextAuth interactúa con tu API REST real (Express en :4000).

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User as NextAuthUser } from "next-auth"; 

// --- 1. Definición de Tipos de Usuario ---
// Debe coincidir con el payload que devuelve tu auth.controller.js
interface CustomUser extends NextAuthUser {
	id: string;
	email: string;
	nombre: string;
	token: string; // El token es esencial para las llamadas protegidas
}

// URL base de tu servidor Express
// Asegúrate de que esta variable de entorno esté definida en tu .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';


// --- 2. Función para Autenticación (Consumo de la API REST) ---
const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			
			// Función CRUCIAL: Intenta autenticar al usuario contra el backend Express
			async authorize(credentials, req) {
				const LOGIN_URL = `${API_BASE_URL}/auth/login`;

				try {
					const response = await fetch(LOGIN_URL, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: credentials?.email,
							password: credentials?.password,
						}),
					});

					// Si el servidor Express no devuelve un 200/OK, se activa el fallo
					if (!response.ok) {
						// Capturamos el error (ej: 401 Credenciales inválidas)
						const error = await response.json();
						console.error("API Login Error (Backend Response 4xx/5xx):", error.message);
						
						// IMPORTANTE: Devolver null en caso de fallo de validación
						// para que NextAuth muestre el error de credenciales.
						return null; 
					}

					const apiData = await response.json();

					// El backend devuelve la propiedad 'usuario' (ver controllers/auth.controller.js)
					const backendUser = apiData.usuario || apiData.user;

					if (!backendUser) {
						console.error('Respuesta inválida del API: No se encontró objeto de usuario.', apiData);
						return null;
					}

					// Mapeamos la respuesta del backend al objeto CustomUser de NextAuth
					const user: CustomUser = {
						id: String(backendUser.id), // Aseguramos que sea string
						email: backendUser.email,
						nombre: backendUser.nombre,
						token: apiData.token || apiData?.token, // Guardamos el token JWT
					};
					
					// Éxito: Retornamos el objeto user
					return user;

				} catch (error) {
					// Fallo en la conexión de red (ej: Express no está corriendo)
					console.error("Error de conexión al servidor Express:", error);
					return null;
				}
			}
		})
	],
	
	// --- 3. Callbacks para Persistir la Sesión ---
	callbacks: {
		// 3a. Almacena el token de la API REST dentro del token JWT de NextAuth
		async jwt({ token, user }: { token: any, user: any }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.nombre = user.nombre;
				token.token = user.token; 
			}
			return token;
		},
		
		// 3b. Expone el token y datos del usuario en la sesión del cliente (useSession)
		async session({ session, token }: { session: any, token: any }) {
			session.user = {
				id: token.id,
				email: token.email,
				nombre: token.nombre,
				token: token.token, // ESTE TOKEN SE USARÁ EN TODOS LOS SERVICIOS PROTEGIDOS
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
	// Usar variable de entorno real
	secret: process.env.NEXTAUTH_SECRET || 'NEXTAUTH_DEFAULT_SECRET', 
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
