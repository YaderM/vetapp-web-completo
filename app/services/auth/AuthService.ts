import api from './api'; 
// CORRECCIÓN 1: Ajustamos la ruta de tipos a ../../ para que no falle al buscarlos
import { LoginData, RegisterData, AuthResponse, Usuario } from '../../types/auth'; 

const AuthService = {
  // ... login se mantiene igual ...
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // CORRECCIÓN 2: Cambiamos el nombre de 'register' a 'registerUser' para coincidir con tu página
  async registerUser(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      console.log('Usuario ha cerrado sesión.');
    }
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  async getProfile(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/profile');
    return response.data;
  }
};

// CORRECCIÓN 3: Exportamos las funciones individualmente para que funcionen los imports con { }
export const registerUser = AuthService.registerUser;
export const login = AuthService.login;
export const logout = AuthService.logout;
export const isAuthenticated = AuthService.isAuthenticated;
export const getProfile = AuthService.getProfile;

// Mantenemos el export default por si acaso
export default AuthService;