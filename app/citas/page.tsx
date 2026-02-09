// app/citas/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
// Importamos los servicios y tipos desde la carpeta 'app'
import { getCitas, Cita } from '@/app/services/cita.service'; 
// ---------------------------------

import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Search, CalendarCheck, List, Eye } from 'lucide-react'; // Añadido Eye
import Link from 'next/link';

// --- Tipos de Datos ---
// 'Cita' ya se importa desde el servicio
// --- Fin de Tipos ---

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCitas(); 
      setCitas(data);
    } catch (err: any) {
      console.error("Error al cargar citas:", err);
      setError(err.message || "No se pudo cargar la lista de citas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  // Filtrar citas (simple, por motivo o paciente)
  const filteredCitas = useMemo(() => {
    if (!searchTerm) {
      return citas;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return citas.filter(c => 
      c.motivo.toLowerCase().includes(lowerCaseSearch) ||
      (c.pacienteNombre && c.pacienteNombre.toLowerCase().includes(lowerCaseSearch)) ||
      (c.propietarioNombre && c.propietarioNombre.toLowerCase().includes(lowerCaseSearch))
    );
  }, [citas, searchTerm]);


  // --- Renderizado ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando agenda de citas...</p>
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
            onClick={loadCitas}
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
            <CalendarCheck className="w-8 h-8 mr-3 text-indigo-600" />
            Agenda de Citas
          </h1>
          
          {/* ----- CORRECCIÓN DE 'legacyBehavior' ----- */}
          <Link 
            href="/citas/crear" // Asumiendo esta ruta por tu estructura de archivos
            className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nueva Cita
          </Link>
          {/* ------------------------------------------- */}

        </div>
        
        {/* Barra de Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por motivo, paciente o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Mensaje si no hay citas registradas */}
        {citas.length === 0 && filteredCitas.length === 0 && (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xl text-gray-600 font-semibold">Aún no hay citas registradas.</p>
                <p className="text-gray-500 mt-2">Usa el botón "Nueva Cita" para comenzar.</p>
            </div>
        )}

        {/* Tabla de Citas */}
        {filteredCitas.length > 0 && (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider hidden sm:table-cell">Propietario</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider hidden md:table-cell">Fecha y Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCitas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                            <Link href={`/pacientes-ficha/${cita.pacienteId}`}>
                                {cita.pacienteNombre || `ID: ${cita.pacienteId}`}
                            </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            {cita.propietarioNombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {new Date(cita.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {cita.motivo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            {/* ----- CORRECCIÓN DE 'legacyBehavior' ----- */}
                            <Link 
                                href={`/citas/${cita.id}`} 
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 transition duration-150 transform hover:scale-105" 
                                title="Ver/Editar Cita"
                            >
                                <Eye className="w-4 h-4" /> 
                            </Link>
                            {/* ------------------------------------------- */}
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