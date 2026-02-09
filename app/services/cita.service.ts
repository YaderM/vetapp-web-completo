// src/services/cita.service.ts
import api from './api';

// --- Tipos de datos para el frontend (adaptados al backend) ---

export interface Cita {
  id: string;
  fecha: string; // Formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
  motivo: string;
  pacienteId: string;
  // Estos campos se usan para mostrar en el frontend, se obtienen por JOIN
  pacienteNombre?: string; 
  propietarioNombre?: string;
}

export interface CitaPayload {
  fecha: string;
  motivo: string;
  pacienteId: string;
}

// --- Funciones CRUD ---

/**
 * Obtiene todas las citas registradas en el sistema.
 * @returns Promesa con el array de citas.
 */
export const getCitas = async (): Promise<Cita[]> => {
  try {
    const response = await api.get('/citas');
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener citas:", error);
    // Propaga el error para que el componente lo maneje
    throw new Error(error.response?.data?.message || "Fallo al listar las citas.");
  }
};

/**
 * Obtiene una cita específica por su ID.
 * @param id El ID de la cita.
 * @returns Promesa con los datos de la cita.
 */
export const getCitaById = async (id: string): Promise<Cita> => {
  try {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener cita ${id}:`, error);
    throw new Error(error.response?.data?.message || "Cita no encontrada.");
  }
};

/**
 * Crea una nueva cita en el sistema.
 * @param payload Los datos de la nueva cita (fecha, motivo, pacienteId).
 * @returns Promesa con la cita creada.
 */
export const createCita = async (payload: CitaPayload): Promise<Cita> => {
  try {
    const response = await api.post('/citas', payload);
    return response.data;
  } catch (error: any) {
    console.error("Error al crear cita:", error);
    throw new Error(error.response?.data?.message || "Fallo al registrar la cita.");
  }
};

/**
 * Actualiza una cita existente.
 * @param id El ID de la cita a actualizar.
 * @param payload Los datos actualizados de la cita.
 * @returns Promesa con la cita actualizada.
 */
export const updateCita = async (id: string, payload: CitaPayload): Promise<Cita> => {
  try {
    const response = await api.put(`/citas/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`Error al actualizar cita ${id}:`, error);
    throw new Error(error.response?.data?.message || "Fallo al actualizar la cita.");
  }
};

/**
 * Elimina una cita por su ID.
 * @param id El ID de la cita a eliminar.
 */
export const deleteCita = async (id: string): Promise<void> => {
  try {
    await api.delete(`/citas/${id}`);
  } catch (error: any) {
    console.error(`Error al eliminar cita ${id}:`, error);
    throw new Error(error.response?.data?.message || "Fallo al eliminar la cita.");
  }
};