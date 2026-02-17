// app/citas/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
import { useParams, useRouter } from 'next/navigation';
import { getCitaById, updateCita, deleteCita, CitaPayload } from '@/app/services/cita.service';
import { getPacientes } from '@/app/services/paciente.service';
// ---------------------------------

import { Loader2, ArrowLeft, Save, Trash2, AlertTriangle, CalendarCheck } from 'lucide-react';

// --- Tipos de Datos ---
interface Paciente {
  id: number; // Asumiendo ID numérico
  nombre: string;
  especie: string;
}

// Interfaz para los datos del formulario (incluye los campos separados de fecha y hora)
interface FormData extends Omit<CitaPayload, 'fecha' | 'pacienteId'> {
    pacienteId: string | number; // El select usa string
    motivo: string;
    fechaCita: string; 
    horaCita: string;
}

const initialFormData: FormData = {
    pacienteId: '',
    motivo: '',
    fechaCita: '',
    horaCita: '',
};
// --- Fin de Tipos ---

/**
 * Función auxiliar para dividir una fecha ISO en fecha (YYYY-MM-DD) y hora (HH:mm)
 */
const splitDateTime = (isoString: string) => {
    if (!isoString) return { fechaCita: '', horaCita: '' };
    try {
        const date = new Date(isoString);
        // Formato para input type="date"
        const datePart = date.toISOString().split('T')[0];
        // Formato para input type="time" (HH:mm) en 24h
        const timePart = date.toTimeString().split(' ')[0].substring(0, 5);
        return { fechaCita: datePart, horaCita: timePart };
    } catch {
        return { fechaCita: '', horaCita: '' };
    }
};

/**
 * Página de Ficha de Cita para ver, editar y eliminar una Cita.
 */
export default function CitaFichaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteInicial, setPacienteInicial] = useState<string>(''); // Para mostrar en el título
  
  // Estados de carga
  const [loading, setLoading] = useState(true); 
  const [isUpdating, setIsUpdating] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 
  
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 

  // --- Carga de Datos ---
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const [citaData, pacientesData] = await Promise.all([
        getCitaById(id),
        getPacientes()
      ]);

      const { fechaCita, horaCita } = splitDateTime(citaData.fecha);

      // Rellena el formulario
      setFormData({
        pacienteId: citaData.pacienteId,
        motivo: citaData.motivo || '',
        fechaCita,
        horaCita,
      });
      setPacientes(pacientesData);
      setPacienteInicial(citaData.pacienteNombre || 'Cita');
      
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError("No se pudo cargar la información de la cita. " + err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Manejadores de Eventos ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Maneja el envío del formulario (Actualización)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { pacienteId, motivo, fechaCita, horaCita } = formData;

    if (!pacienteId || !motivo || !fechaCita || !horaCita) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsUpdating(true);

    try {
        // Combina la fecha y la hora para formar la fecha ISO
        const fechaHoraCombined = new Date(`${fechaCita}T${horaCita}`).toISOString();

        const payload: CitaPayload = {
            pacienteId: String(pacienteId),
            motivo,
            fecha: fechaHoraCombined,
        };

        // Llamada al servicio de actualización
        await updateCita(id, payload);
        alert("Cita actualizada exitosamente.");
        router.push('/citas'); 
    } catch (err: any) {
      console.error("Error al actualizar cita:", err);
      setError(err.message || "Ocurrió un error al actualizar.");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Maneja la eliminación de la cita (después de confirmación)
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Llamada al servicio de eliminación
      await deleteCita(id);
      alert("Cita eliminada exitosamente.");
      router.push('/citas'); 
    } catch (err: any) {
      console.error("Error al eliminar cita:", err);
      setError(err.message || "Ocurrió un error al eliminar.");
      setIsDeleting(false);
      setShowDeleteConfirm(false); 
    }
  };

  // --- Renderizado ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando datos de la cita...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (error && !loading) {
     return (
      <MainLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-4xl mx-auto" role="alert">
          <strong className="font-bold">Error al cargar datos:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={loadData}
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
      
      {/* --- Modal de Confirmación de Eliminación --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
              Confirmar Eliminación
            </h2>
            <p className="text-gray-600 my-4">
              ¿Estás seguro de que deseas eliminar la cita para **{pacienteInicial}**?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="py-2 px-4 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-2 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 flex items-center disabled:bg-red-400"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                <span className="ml-2">{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- Fin del Modal --- */}

      {/* --- Formulario Principal de Edición --- */}
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarCheck className="w-7 h-7 mr-3 text-indigo-600" />
            Editar Cita: {pacienteInicial}
          </h1>
          <button
            onClick={() => router.push('/citas')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Volver
          </button>
        </div>

        {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2" /> {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Selector de Paciente */}
          <div>
            <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700">Paciente</label>
            {pacientes.length === 0 ? (
                <p className="mt-1 text-red-500">No hay pacientes cargados.</p>
            ) : (
                <select
                    name="pacienteId"
                    id="pacienteId"
                    value={formData.pacienteId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                    <option value="" disabled>Seleccione un paciente</option>
                    {pacientes.map(paciente => (
                        <option key={paciente.id} value={paciente.id}>
                            {paciente.nombre} ({paciente.especie})
                        </option>
                    ))}
                </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campo Fecha */}
            <div>
              <label htmlFor="fechaCita" className="block text-sm font-medium text-gray-700">Fecha de la Cita</label>
              <input
                type="date"
                name="fechaCita"
                id="fechaCita"
                value={formData.fechaCita}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Campo Hora */}
            <div>
              <label htmlFor="horaCita" className="block text-sm font-medium text-gray-700">Hora de la Cita</label>
              <input
                type="time"
                name="horaCita"
                id="horaCita"
                value={formData.horaCita}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {/* Campo Motivo */}
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">Motivo de la Cita</label>
            <textarea
              name="motivo"
              id="motivo"
              value={formData.motivo}
              onChange={handleChange}
              rows={3}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex justify-between items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating || isDeleting}
              className="w-1/3 flex justify-center py-3 px-4 border border-red-600 rounded-lg shadow-sm text-lg font-medium text-red-600 bg-white hover:bg-red-50 transition duration-300 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Eliminar
            </button>
            <button
              type="submit"
              disabled={isUpdating || isDeleting}
              className={`w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition duration-300 ${
                isUpdating 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Cambios
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}