// app/citas/crear/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
// Importamos los servicios de cita Y de paciente (para el dropdown)
import { createCita, type CitaPayload } from '@/app/services/cita.service';
import { getPacientes, type Paciente } from '@/app/services/paciente.service';
// ---------------------------------

import { Loader2, CalendarCheck, Save, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Tipos de Datos ---
// Usamos un tipo simple para el dropdown de pacientes
interface PacienteOption {
  id: number;
  nombre: string;
  propietarioNombre: string;
}

const initialFormData: Omit<CitaPayload, 'fecha'> & { fechaCita: string; horaCita: string } = {
  pacienteId: '',
  motivo: '',
  fechaCita: '',
  horaCita: '',
};
// --- Fin de Tipos ---


export default function CrearCitaPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
  
  const [loading, setLoading] = useState(true); // Carga inicial de pacientes
  const [isSubmitting, setIsSubmitting] = useState(false); // Envío de formulario
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Cargar los pacientes para el <select>
  const loadPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: Paciente[] = await getPacientes();
      // Mapeamos los datos para el dropdown
      setPacientes(data.map(p => ({ 
          id: p.id, 
          nombre: p.nombre,
          // Asumimos que getPacientes() devuelve el propietario anidado
          propietarioNombre: p.propietario ? `${p.propietario.nombre} ${p.propietario.apellido}` : 'Sin Propietario'
      })));
    } catch (err: any) {
      console.error("Error al cargar pacientes:", err);
      setError("Error al cargar la lista de pacientes. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacientes();
  }, [loadPacientes]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const { pacienteId, motivo, fechaCita, horaCita } = formData;

    if (!pacienteId || !motivo || !fechaCita || !horaCita) {
      setError("Todos los campos son obligatorios.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Combinamos la fecha y la hora en un formato ISO 8601 válido
      const fechaHoraISO = new Date(`${fechaCita}T${horaCita}`).toISOString();

      const dataToSend: CitaPayload = {
        fecha: fechaHoraISO,
        motivo,
        pacienteId: Number(pacienteId),
      };

      await createCita(dataToSend);
      setSuccess("¡Cita registrada exitosamente! Redirigiendo...");

      setFormData(initialFormData);
      setTimeout(() => {
        router.push('/citas');
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando formulario...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <CalendarCheck className="w-8 h-8 mr-3 text-indigo-600" />
            Registrar Nueva Cita
          </h1>
          <Link 
            href="/citas"
            className="flex items-center text-gray-500 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a la Agenda
          </Link>
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
            
            {/* Selector de Paciente */}
            <div>
              <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700">
                Paciente <span className="text-red-500">*</span>
              </label>
              <select
                id="pacienteId"
                name="pacienteId"
                value={formData.pacienteId}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="" disabled>Seleccione un paciente...</option>
                {pacientes.length > 0 ? (
                  pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Propietario: {p.propietarioNombre})
                    </option>
                  ))
                ) : (
                  <option disabled>No hay pacientes cargados</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div>
                <label htmlFor="fechaCita" className="block text-sm font-medium text-gray-700">Fecha <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  id="fechaCita"
                  name="fechaCita"
                  value={formData.fechaCita}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Hora */}
              <div>
                <label htmlFor="horaCita" className="block text-sm font-medium text-gray-700">Hora <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  id="horaCita"
                  name="horaCita"
                  value={formData.horaCita}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>


            {/* Motivo */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">Motivo de la Cita <span className="text-red-500">*</span></label>
              <textarea
                id="motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                rows={4}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="Ej: Vacunación anual, revisión, etc."
              />
            </div>

            <div className="text-right pt-4">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isSubmitting ? 'Guardando...' : 'Guardar Cita'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </MainLayout>
  );
}