// app/services/paciente.service.ts
import api from "./api"; // Importa la instancia de Axios desde el archivo api.ts en esta misma carpeta

// --- Tipos de Datos (Deben reflejar la estructura de la API/DB) ---

// Tipo para la información del propietario que viene anidada
export interface PropietarioInfo {
  id: number;
  nombre: string;
  apellido: string;
}

// Tipo principal para el Paciente
export interface Paciente {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  historialMedico: string;
  propietario: PropietarioInfo; // Relación anidada
}

// Tipo para el formulario (lo que enviamos al backend)
export interface PacienteFormData {
  nombre: string;
  especie: string;
  raza: string;
  edad: number | ''; // El formulario puede tener string vacío
  historialMedico: string;
  propietarioId: string | number; // Solo necesitamos el ID para el POST/PUT
}

// --- Funciones del Servicio (CRUD) ---

// 1. Obtener todos los pacientes (GET /pacientes)
export const getPacientes = async (): Promise<Paciente[]> => {
  try {
    const response = await api.get("/pacientes"); 
    return response.data; 
  } catch (error: any) {
    console.error("Error en servicio getPacientes:", error);
    throw new Error(error.response?.data?.message || "No se pudo cargar la lista de pacientes.");
  }
};

// 2. Crear un nuevo paciente (POST /pacientes)
export const createPaciente = async (data: PacienteFormData): Promise<Paciente> => {
  try {
    const response = await api.post("/pacientes", data);
    return response.data;
  } catch (error: any) {
    console.error("Error en servicio createPaciente:", error);
    throw new Error(error.response?.data?.message || "Error desconocido al crear el paciente.");
  }
};

// 3. Obtener un paciente por ID (GET /pacientes/:id)
export const getPacienteById = async (id: string | number): Promise<Paciente> => {
  try {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error en servicio getPacienteById ${id}:`, error);
    throw new Error(error.response?.data?.message || `No se pudo cargar la ficha médica del paciente.`);
  }
};

// 4. Actualizar un paciente (PUT /pacientes/:id)
export const updatePaciente = async (id: string | number, data: PacienteFormData): Promise<Paciente> => {
  try {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error en servicio updatePaciente ${id}:`, error);
    throw new Error(error.response?.data?.message || "Error desconocido al actualizar el paciente.");
  }
};

// 5. Eliminar un paciente (DELETE /pacientes/:id)
export const deletePaciente = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`/pacientes/${id}`);
  } catch (error: any) {
    console.error(`Error en servicio deletePaciente ${id}:`, error);
    throw new Error(error.response?.data?.message || "Error desconocido al eliminar el paciente.");
  }
};