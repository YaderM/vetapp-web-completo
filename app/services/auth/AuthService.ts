// CORRECCIÓN 1: Agregamos un punto extra (..) para buscar api.ts en la carpeta 'services'
import api from '../api'; 
// CORRECCIÓN 2: Mantenemos la ruta de tipos que ya arreglamos antes
import { LoginData, RegisterData, AuthResponse, Usuario } from '../../types/auth'; 

const AuthService = {
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

// Exportaciones individuales
export const registerUser = AuthService.registerUser;
export const login = AuthService.login;
export const logout = AuthService.logout;
export const isAuthenticated = AuthService.isAuthenticated;
export const getProfile = AuthService.getProfile;

export default AuthService;