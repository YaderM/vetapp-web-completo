// app/services/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react'; 

// 1. Creamos la instancia de Axios
const api = axios.create({
  // FORZAMOS la URL de Vercel aquí para evitar que Render se llame a sí mismo
  baseURL: 'https://vetapp-web-completo.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
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