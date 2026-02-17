// app/services/api.ts
// Este es el "corazón" de la conexión del frontend con el backend.

import axios from 'axios';
import { getSession } from 'next-auth/react'; 

// 1. Creamos la instancia de Axios con la URL base del backend
const api = axios.create({
  // CORRECCIÓN: Usamos el nombre exacto configurado en Render
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
});

// 2. Interceptor de Solicitud (Request Interceptor)
api.interceptors.request.use(
  async (config) => {
    // Obtenemos la sesión actual del cliente (de NextAuth)
    const session = await getSession();

    // Si la sesión existe y tiene el token de la API...
    if (session && (session as any).user && (session as any).user.token) {
      // Adjuntamos el token al encabezado 'Authorization'
      config.headers.Authorization = `Bearer ${(session as any).user.token}`;
    }
    
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;