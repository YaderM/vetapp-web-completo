// app/pacientes/[id]/page.tsx
'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PawPrint, User, Home, Edit2, Trash2, ArrowLeft, Loader2, Calendar, ClipboardList } from 'lucide-react';
// Importa el servicio para el GET del paciente por ID y las constantes de diseño
import { getPacienteById, deletePaciente } from '@/services/paciente.service'; 
import MainLayout from '@/components/Layout/MainLayout';

// --- Tipos de Datos (Deben coincidir con la API) ---
interface PropietarioInfo {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}

interface PacienteFicha {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  historialMedico: string; // Historial inicial o resumen
  propietario: PropietarioInfo; // Datos del propietario asociado
  // En un sistema real, aquí iría un array de Consultas/Historial Clínico
  consultas?: any[]; 
}

// --- Fin de Tipos ---

export default function FichaPacientePage({ params }: { params: { id: string } }) {
  const id = params?.id;
  const router = useRouter();
  
  const [paciente, setPaciente] = useState<PacienteFicha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Obtener la ficha del paciente
  useEffect(() => {
    async function fetchPaciente() {
      try {
        setLoading(true);
        setError(null);
        // Función real para obtener el paciente por su ID, incluyendo el propietario asociado
        const data= await getPacienteById(id); 
        setPaciente(data as any);
      } catch (err: any) {
        console.error('Error al cargar la ficha del paciente:', err);
        setError(err.message || "No se pudo cargar la ficha médica. ID no válido.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPaciente();
    }
  }, [id]);

  // Manejo de la Eliminación (Requisito: Edición y eliminación con confirmación visual)
  const handleEliminar = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${paciente?.nombre} (ID: ${id})? Esta acción no se puede deshacer.`)) {
      try {
        await deletePaciente(id);
        alert('Paciente eliminado exitosamente.');
        router.push('/pacientes'); // Redirigir al listado después de la eliminación
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el paciente.');
      }
    }
  };


  // --- Renderizado de Estados ---

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center h-96 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando ficha médica...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !paciente) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-2xl text-red-600 font-semibold">{error || "Paciente no encontrado."}</p>
          <button
            onClick={() => router.push('/pacientes')}
            className="mt-6 flex items-center justify-center mx-auto text-indigo-600 hover:text-indigo-800 transition duration-150"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Volver al Listado de Pacientes
          </button>
        </div>
      </MainLayout>
    );
  }

  // --- Renderizado de Contenido ---
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        
        {/* Cabecera y Acciones */}
        <div className="flex items-start justify-between mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PawPrint className="w-8 h-8 mr-3 text-indigo-600" />
            Ficha Médica: {paciente.nombre}
          </h1>
          <div className="flex space-x-3">
            <Link href={`/pacientes/editar/${id}`} passHref>
              <button
                className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
                title="Editar Datos del Paciente"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Editar
              </button>
            </Link>
            <button
              onClick={handleEliminar}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
              title="Eliminar Paciente"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Eliminar
            </button>
          </div>
        </div>

        {/* Datos del Paciente y Propietario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna 1: Información General del Paciente */}
          <section className="lg:col-span-1 space-y-4 p-6 bg-indigo-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-indigo-800 border-b pb-2 mb-3">Datos del Paciente</h2>
            <p className="text-lg">
              <span className="font-semibold text-gray-600">Especie:</span> {paciente.especie}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-gray-600">Raza:</span> {paciente.raza || 'N/A'}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-gray-600">Edad:</span> {paciente.edad > 0 ? `${paciente.edad} años` : 'Desconocida'}
            </p>
          </section>

          {/* Columna 2: Propietario Asociado (Requisito: Relación uno-a-muchos) */}
          <section className="lg:col-span-2 space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Propietario Asociado
            </h2>
            {paciente.propietario ? (
                <div>
                    <p className="text-2xl font-bold text-indigo-700">
                        {paciente.propietario.nombre} {paciente.propietario.apellido}
                    </p>
                    <p className="flex items-center text-gray-600 mt-1">
                        <Home className="w-4 h-4 mr-2" />
                        ID Propietario: {paciente.propietario.id}
                    </p>
                    <Link href={`/propietarios/${paciente.propietario.id}`} passHref>
                        <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
                            Ver Ficha del Propietario &rarr;
                        </button>
                    </Link>
                </div>
            ) : (
                <p className="text-red-500 font-medium">ERROR: Propietario no vinculado.</p>
            )}
          </section>
        </div>

        {/* Historial Clínico (Sección principal de la Ficha Médica) */}
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
            <ClipboardList className="w-6 h-6 mr-2" />
            Historial Médico y Consultas
          </h2>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Historial Inicial</h3>
                <p className="text-gray-600 whitespace-pre-line">
                    {paciente.historialMedico || "No hay historial inicial registrado."}
                </p>
            </div>

            {/* Simulación del listado de Consultas Médicas */}
            <h3 className="text-xl font-semibold text-gray-700 flex items-center pt-4 border-t">
                <Calendar className="w-5 h-5 mr-2" />
                Registro de Consultas
            </h3>
            {paciente.consultas && paciente.consultas.length > 0 ? (
              // Aquí iría un componente de listado de Consultas
              <div className="border border-dashed p-4 text-center">
                  [Lista de Consultas con fecha, motivo y doctor]
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay consultas médicas registradas para este paciente.</p>
            )}
            
            <button className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300">
                + Añadir Nueva Consulta
            </button>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}