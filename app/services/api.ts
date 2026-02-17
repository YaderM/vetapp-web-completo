import axios from 'axios';
import { getSession } from 'next-auth/react'; 

// 1. Instancia de Axios
const api = axios.create({
  // Al estar todo en Vercel, solo necesitamos /api
  // Esto funcionará tanto en tu PC (localhost) como en Vercel automáticamente
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor para el manejo de tokens
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();

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