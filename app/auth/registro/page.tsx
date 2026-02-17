"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../services/auth/AuthService';
import { RegisterData } from '../../types/auth.types'; 
import { Loader2, UserPlus, AlertCircle, CalendarCheck } from 'lucide-react';

// Extendemos la interfaz localmente para incluir el rol si no está en el tipo original
interface ExtendedRegisterData extends RegisterData {
  role?: string;
}

const initialFormData: ExtendedRegisterData = {
  nombre: '',
  email: '',
  password: '',
  role: 'user', // ✅ Valor por defecto para nuevos usuarios/clientes
};

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ExtendedRegisterData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!formData.nombre || !formData.email || !formData.password) {
      setError("Por favor, complete todos los campos.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Enviamos el formData que ya incluye el campo 'role'
      await registerUser(formData);

      setSuccess("¡Registro exitoso! Redirigiendo al login...");
      
      setTimeout(() => {
        router.push('/auth/login'); // 🔄 Mejor redirigir al login para que use sus nuevas credenciales
      }, 1500);

    } catch (err: any) {
      console.error("Error de registro:", err);
      setError(err.message || "Ocurrió un error desconocido al registrar.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        
        <div className="text-center">
            <CalendarCheck className="mx-auto h-12 w-auto text-indigo-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Crea tu cuenta en VetApp
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Regístrate como cliente para gestionar tus mascotas.
            </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start" role="alert">
            <AlertCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre Completo"
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Dirección de Email"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {/* ✅ SELECT DE ROL PARA QUE EL PROFE PUEDA ELEGIR */}
          <div className="mt-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="user">Cliente (Mascotas)</option>
              <option value="admin">Administrador (Clínica)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition duration-300 ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
              ) : (
                <UserPlus className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Registrando...' : 'Registrar Cuenta'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?
                <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                    Inicia Sesión aquí
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}