import api from "./api"; // Asume que './api' es la instancia de Axios configurada con el token de auth.

// --- Tipos de Datos (Deben reflejar la estructura de la base de datos) ---

export interface Propietario {
  id: string; // O _id, según tu backend
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  // Opcional: Para mostrar las mascotas en la ficha
  // pacientes?: { id: string, nombre: string }[]; 
}

// Tipo de datos para enviar en la creación y actualización (payload)
export interface PropietarioFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

// --- Funciones CRUD ---

/**
 * Obtiene la lista completa de propietarios del sistema.
 * @returns Promesa con el array de Propietarios.
 */
export const getPropietarios = async (): Promise<Propietario[]> => {
  try {
    // Llama al endpoint de tu API de Express: GET /api/propietarios
    const response = await api.get("/propietarios"); 
    return response.data; 
  } catch (error: any) {
    console.error("Error al obtener propietarios:", error);
    throw new Error(error.response?.data?.message || "No se pudo cargar la lista de propietarios.");
  }
};

/**
 * Crea un nuevo propietario en el sistema.
 * @param data Los datos del nuevo propietario.
 * @returns Promesa con el propietario creado.
 */
export const createPropietario = async (data: PropietarioFormData): Promise<Propietario> => {
  try {
    // Llama al endpoint de tu API de Express: POST /api/propietarios
    const response = await api.post("/propietarios", data);
    return response.data;
  } catch (error: any) {
    console.error("Error al crear propietario:", error);
    throw new Error(error.response?.data?.message || "Error desconocido al registrar el propietario.");
  }
};

/**
 * Obtiene un propietario específico por su ID.
 * @param id El ID del propietario.
 * @returns Promesa con los datos del propietario.
 */
export const getPropietarioById = async (id: string): Promise<Propietario> => {
  try {
    // Llama al endpoint de tu API de Express: GET /api/propietarios/:id
    const response = await api.get(`/propietarios/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener propietario ${id}:`, error);
    throw new Error(error.response?.data?.message || "Propietario no encontrado.");
  }
};

/**
 * Actualiza un propietario existente.
 * @param id El ID del propietario a actualizar.
 * @param data Los datos actualizados.
 * @returns Promesa con el propietario actualizado.
 */
export const updatePropietario = async (id: string, data: PropietarioFormData): Promise<Propietario> => {
  try {
    // Llama al endpoint de tu API de Express: PUT/PATCH /api/propietarios/:id
    const response = await api.put(`/propietarios/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error al actualizar propietario ${id}:`, error);
    throw new Error(error.response?.data?.message || "Fallo al actualizar el propietario.");
  }
};

/**
 * Elimina un propietario por su ID.
 * @param id El ID del propietario a eliminar.
 */
export const deletePropietario = async (id: string): Promise<void> => {
  try {
    // Llama al endpoint de tu API de Express: DELETE /api/propietarios/:id
    await api.delete(`/propietarios/${id}`);
  } catch (error: any) {
    console.error(`Error al eliminar propietario ${id}:`, error);
    throw new Error(error.response?.data?.message || "Fallo al eliminar el propietario.");
  }
};
