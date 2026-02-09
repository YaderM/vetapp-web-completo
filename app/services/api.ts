// app/services/api.ts
// Este es el "corazón" de la conexión del frontend con el backend.

import axios from 'axios';
import { getSession } from 'next-auth/react'; // Se usa para obtener la sesión en el cliente

// 1. Creamos la instancia de Axios con la URL base del backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // 'http://localhost:3001/api'
});

// 2. Interceptor de Solicitud (Request Interceptor)
// Esto se ejecuta ANTES de que cualquier petición (get, post, put) salga.
api.interceptors.request.use(
  async (config) => {
    // Obtenemos la sesión actual del cliente (de NextAuth)
    const session = await getSession();

    // Si la sesión existe y tiene el token de la API...
    if (session && session.user && session.user.token) {
      // ...adjuntamos el token al encabezado 'Authorization'
      // Esto es lo que usa tu 'auth.middleware.js' (el 'protect') en el backend.
      config.headers.Authorization = `Bearer ${session.user.token}`;
    }
    
    return config; // Continuamos con la petición (ahora con el token)
  },
  (error) => {
    // Manejo de errores si la configuración de la petición falla
    return Promise.reject(error);
  }
);

// 3. Exportamos la instancia de Axios por defecto
// Esto soluciona el error "Export default doesn't exist"
export default api;