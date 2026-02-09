import api from './api'; // Importa la instancia de Axios configurada
// Importamos 'Usuario' (o 'User' si lo llamas diferente) desde los tipos
import { LoginData, RegisterData, AuthResponse, Usuario } from '../types/auth'; 

/**
 * Servicio de Autenticación.
 * Gestiona la lógica de negocio para la autenticación de usuarios (Login, Registro, Logout).
 */
const AuthService = {
  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * @param data - El email y la contraseña del usuario.
   * @returns Promesa con los datos de autenticación (token y usuario).
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Llama al endpoint de login
      const response = await api.post<AuthResponse>('/auth/login', data);

      // Si es exitoso, guarda el token en el almacenamiento local
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Re-lanza el error para el manejo en la interfaz de usuario
      throw error;
    }
  },

  /**
   * Intenta registrar un nuevo usuario.
   * @param data - Los datos del nuevo usuario (nombre, email, contraseña).
   * @returns Promesa con los datos de autenticación.
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Llama al endpoint de registro
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      // Guarda el token automáticamente al registrarse
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario eliminando el token del almacenamiento local.
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      console.log('Usuario ha cerrado sesión.');
      // En una aplicación real, probablemente harías una redirección aquí.
    }
  },

  /**
   * Verifica la presencia de un token de autenticación.
   * @returns true si el usuario tiene un token, false en caso contrario.
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  /**
   * Obtiene la información del perfil del usuario autenticado.
   * Nota: Este endpoint debe estar protegido por un token JWT en el backend.
   * @returns Promesa con los datos del perfil del usuario (Usuario).
   */
  async getProfile(): Promise<Usuario> {
    // Definimos que el tipo de respuesta esperado es Usuario
    const response = await api.get<Usuario>('/auth/profile');
    return response.data;
  }
};

export default AuthService;
