// app/propietarios/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 

// ----- IMPORTES -----
import MainLayout from '@/app/components/Layout/MainLayout';
import { getPropietarios } from '@/app/services/propietario.service'; 
import { type Propietario } from '@/app/services/propietario.service'; 

import Link from 'next/link';
import { Loader2, PlusCircle, Search, User, Edit2, Eye, Trash2 } from 'lucide-react';

export default function PropietariosPage() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadPropietarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPropietarios(); 
      setPropietarios(data);
    } catch (err: any) {
      console.error("Error al cargar propietarios:", err);
      setError(err.message || "No se pudo cargar la lista de propietarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPropietarios();
  }, [loadPropietarios]);

  // Filtrar propietarios
  const filteredPropietarios = useMemo(() => {
    if (!searchTerm) {
      return propietarios;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return propietarios.filter(p => 
      p.nombre.toLowerCase().includes(lowerCaseSearch) ||
      p.apellido.toLowerCase().includes(lowerCaseSearch) ||
      p.email.toLowerCase().includes(lowerCaseSearch) ||
      p.telefono.includes(searchTerm)
    );
  }, [propietarios, searchTerm]);

  // --- Renderizado ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando propietarios...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-4xl mx-auto" role="alert">
          <strong className="font-bold">Error al cargar datos:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={loadPropietarios}
            className="mt-2 block text-sm font-medium text-red-600 hover:text-red-800 transition duration-150"
          >
            Reintentar
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <User className="w-8 h-8 mr-3 text-indigo-600" />
            Gestión de Propietarios
          </h1>
          <Link href="/propietarios/crear" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 font-medium">
            <PlusCircle className="w-5 h-5 mr-2" />
            Nuevo Propietario
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6 flex items-center">
          <Search className="w-5 h-5 text-gray-400 absolute ml-3" />
          <input 
            type="text"
            placeholder="Buscar por nombre, apellido, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Tabla de Propietarios */}
        {filteredPropietarios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron propietarios</p>
            <Link href="/propietarios/crear" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
              <PlusCircle className="w-5 h-5 mr-2" />
              Crear nuevo propietario
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPropietarios.map((propietario) => (
                  <tr key={propietario.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{propietario.nombre} {propietario.apellido}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{propietario.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{propietario.telefono}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{propietario.direccion || '-'}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                      <Link 
                        href={`/propietarios/${propietario.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/propietarios/editar/${propietario.id}`}
                        className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
              Mostrando <strong>{filteredPropietarios.length}</strong> de <strong>{propietarios.length}</strong> propietarios
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
