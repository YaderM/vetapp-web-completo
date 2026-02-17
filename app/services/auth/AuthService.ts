// CORRECCIÓN 1: Importación de la instancia de API
import api from '../api'; 
// CORRECCIÓN 2: Tipos de datos
import { LoginData, RegisterData, AuthResponse, Usuario } from '../../types/auth'; 

const AuthService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // ✅ CORRECTO: Sin barra inicial usa la baseURL de Vercel
      const response = await api.post<AuthResponse>('auth/login', data);
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
      // 🛠️ CORREGIDO: Quitamos la barra '/' inicial para que NO llame a Render
      const response = await api.post<AuthResponse>('auth/register', data);
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
    // 🛠️ CORREGIDO: Quitamos la barra '/' inicial
    const response = await api.get<Usuario>('auth/profile');
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