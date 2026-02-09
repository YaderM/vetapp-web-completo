// app/pacientes-listado/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 

// ----- ¡CORRECCIÓN DE RUTAS! -----
// Apuntamos a la ubicación real dentro de 'app/'
import MainLayout from '@/app/components/Layout/MainLayout';
// Y también aquí para el servicio
import { getPacientes } from '@/app/services/paciente.service'; 
// Asumimos que el tipo Paciente también viene de allí
import { type Paciente } from '@/app/services/paciente.service'; 
// ---------------------------------

import Link from 'next/link';
import { Loader2, PlusCircle, Search, PawPrint, Edit2, User, Eye } from 'lucide-react';

// --- Tipos de Datos (Asumiendo la estructura de tu API) ---
// 'Paciente' ya se importa desde el servicio
// --- Fin de Tipos ---

export default function PacientesListadoPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPacientes(); 
      setPacientes(data);
    } catch (err: any) {
      console.error("Error al cargar pacientes:", err);
      setError(err.message || "No se pudo cargar la lista de pacientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacientes();
  }, [loadPacientes]);

  // Filtrar pacientes
  const filteredPacientes = useMemo(() => {
    if (!searchTerm) {
      return pacientes;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return pacientes.filter(p => 
      p.nombre.toLowerCase().includes(lowerCaseSearch) ||
      p.especie.toLowerCase().includes(lowerCaseSearch) ||
      (p.raza && p.raza.toLowerCase().includes(lowerCaseSearch)) ||
      (p.propietario && `${p.propietario.nombre} ${p.propietario.apellido}`.toLowerCase().includes(lowerCaseSearch))
    );
  }, [pacientes, searchTerm]);


  // --- Renderizado ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando pacientes...</p>
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
            onClick={loadPacientes}
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
            <PawPrint className="w-8 h-8 mr-3 text-indigo-600" />
            Gestión de Pacientes
          </h1>
          
          <Link 
            href="/pacientes-crear" // Asumiendo esta ruta por tu estructura de archivos
            className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nuevo Paciente
          </Link>
        </div>
        
        {/* Barra de Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, especie, raza o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Mensaje de Pacientes No Encontrados */}
        {pacientes.length > 0 && filteredPacientes.length === 0 && (
            <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <p className="text-lg text-yellow-800 font-medium">No se encontraron pacientes que coincidan con "{searchTerm}".</p>
            </div>
        )}

        {/* Mensaje si no hay pacientes registrados */}
        {pacientes.length === 0 && filteredPacientes.length === 0 && (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xl text-gray-600 font-semibold">Aún no hay pacientes registrados.</p>
                <p className="text-gray-500 mt-2">Usa el botón "Nuevo Paciente" para comenzar.</p>
            </div>
        )}

        {/* Tabla de Pacientes */}
        {filteredPacientes.length > 0 && (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Nombre (Paciente)</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider hidden sm:table-cell">Especie / Raza</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider hidden md:table-cell">Propietario</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">Ficha Médica</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {filteredPacientes.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/pacientes-ficha/${paciente.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                                {paciente.nombre}
                            </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                           {paciente.especie} / {paciente.raza || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {paciente.propietario ? (
                                <Link href={`/propietarios/${paciente.propietario.id}`} className="flex items-center hover:underline">
                                    <User className="w-4 h-4 mr-1 text-gray-400" />
                                    {paciente.propietario.nombre} {paciente.propietario.apellido}
                                </Link>
                            ) : (
                                <span className="text-red-500 italic">Sin asignar</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <Link 
                                href={`/pacientes-ficha/${paciente.id}`} 
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 transition duration-150 transform hover:scale-105" 
                                title="Ver Ficha Médica"
                            >
                                <Eye className="w-4 h-4" /> 
                            </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </MainLayout>
  );
}