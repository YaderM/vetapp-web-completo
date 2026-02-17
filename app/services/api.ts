import axios from 'axios';
import { getSession } from 'next-auth/react'; 

// 1. Instancia de Axios apuntando directamente a Vercel
const api = axios.create({
  // Nota: No incluimos barra '/' al final de la URL para evitar duplicados
  baseURL: 'https://vetapp-web-completo.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor para el manejo de tokens
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    // Verificamos la existencia del token en la sesión de NextAuth
    if (session && (session as any).user && (session as any).user.token) {
      config.headers.Authorization = `Bearer ${(session as any).user.token}`;
    }
    
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;