// Usamos el nombre 'Data' para las peticiones de datos
export interface LoginData {
  email: string;
  password: string;
}

// Usamos 'nombre' en lugar de 'fullName' para ser consistentes con el formulario
export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

// Estructura mínima del perfil de un usuario
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  role: 'veterinario' | 'asistente' | 'admin';
}

// Estructura de la respuesta exitosa de Login/Registro del API
// Contiene el token y la información del usuario
export interface AuthResponse {
  token: string;
  user: Usuario;
}
