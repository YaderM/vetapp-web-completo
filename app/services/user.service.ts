// app/services/user.service.ts
import api from "./api"; // Importa la instancia de Axios
import { getSession } from 'next-auth/react';

// Interfaz para los datos del perfil que podemos actualizar
export interface UserProfileData {
  nombre: string;
  email: string;
  // (No incluimos la contraseña aquí por seguridad, 
  // se manejaría en un endpoint separado si se quisiera cambiar)
}

/**
 * Obtiene los datos del perfil del usuario actualmente logueado.
 * El backend (controlador) obtendrá el ID del usuario desde el token JWT.
 */
export const getMyProfile = async (): Promise<UserProfileData> => {
  try {
    // La ruta '/api/perfil/me' será definida en el backend
    const response = await api.get('/perfil/me'); 
    return response.data;
  } catch (error: any) {
    console.error("Error en servicio getMyProfile:", error);
    throw new Error(error.response?.data?.message || "No se pudo cargar el perfil.");
  }
};

/**
 * Actualiza los datos del perfil del usuario actualmente logueado.
 */
export const updateMyProfile = async (data: UserProfileData): Promise<UserProfileData> => {
  try {
    const response = await api.put('/perfil/me', data);
    return response.data;
  } catch (error: any) {
    console.error("Error en servicio updateMyProfile:", error);
    throw new Error(error.response?.data?.message || "Error al actualizar el perfil.");
  }
};