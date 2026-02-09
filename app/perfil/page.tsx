// app/perfil/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
// Importamos el nuevo servicio
import { getMyProfile, updateMyProfile, UserProfileData } from '@/app/services/user.service';
// ---------------------------------

import { Loader2, UserCircle, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PerfilPage() {
  const { data: session, update: updateSession } = useSession(); // Usamos 'update' de NextAuth
  const [formData, setFormData] = useState<UserProfileData>({ nombre: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos iniciales del perfil
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProfile();
      setFormData(data);
    } catch (err: any) {
      console.error("Error al cargar perfil:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsUpdating(true);

    if (!formData.nombre || !formData.email) {
      setError("El nombre y el email no pueden estar vacíos.");
      setIsUpdating(false);
      return;
    }

    try {
      const updatedData = await updateMyProfile(formData);
      
      // ¡Actualiza la sesión de NextAuth en el cliente!
      // Esto cambiará el nombre en el MainLayout (Sidebar) en tiempo real
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          nombre: updatedData.nombre,
          email: updatedData.email,
        }
      });
      
      setSuccess("Perfil actualizado exitosamente.");
    } catch (err: any) {
      setError(err.message || "Error al actualizar.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Renderizado ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando perfil...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <UserCircle className="w-8 h-8 mr-3 text-indigo-600" />
            Perfil de Usuario
          </h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" /> {success}
              </div>
            )}

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </MainLayout>
  );
}