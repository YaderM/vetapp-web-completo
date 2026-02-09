'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
// Importamos los servicios de paciente Y de propietario
import { createPaciente, type PacienteFormData } from '@/app/services/paciente.service';
import { getPropietarios, type Propietario } from '@/app/services/propietario.service';
// ---------------------------------

import { Loader2, PlusCircle, Save, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Tipos de Datos ---
// Usamos un tipo simple para el dropdown de propietarios
interface PropietarioOption {
  id: number;
  nombre: string;
}
// --- Fin de Tipos ---

const initialFormState: PacienteFormData = {
  nombre: '',
  especie: '',
  raza: '',
  edad: '',
  historialMedico: '',
  propietarioId: '',
};

export default function PacientesCrearPage() {
  const [formData, setFormData] = useState<PacienteFormData>(initialFormState);
  const [propietarios, setPropietarios] = useState<PropietarioOption[]>([]);
  
  const [loading, setLoading] = useState(true); // Carga inicial de propietarios
  const [isSubmitting, setIsSubmitting] = useState(false); // Envío de formulario
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Cargar los propietarios para el <select>
  const loadPropietarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: Propietario[] = await getPropietarios();
      // Mapeamos solo los datos que necesitamos para el dropdown
      setPropietarios(data.map(p => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}` })));
    } catch (err: any) {
      console.error("Error al cargar propietarios:", err);
      setError("Error al cargar la lista de propietarios. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPropietarios();
  }, [loadPropietarios]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!formData.nombre || !formData.especie || !formData.propietarioId) {
      setError("Nombre, Especie y Propietario son campos obligatorios.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Preparamos los datos para enviar
      const dataToSend = {
        ...formData,
        edad: formData.edad === '' ? null : Number(formData.edad),
        propietarioId: Number(formData.propietarioId)
      };

      await createPaciente(dataToSend as any); // Enviamos al servicio
      setSuccess("¡Paciente registrado exitosamente! Redirigiendo...");

      // Limpiar formulario y redirigir
      setFormData(initialFormState);
      setTimeout(() => {
        router.push('/pacientes-listado');
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear el paciente.");
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <PlusCircle className="w-8 h-8 mr-3 text-indigo-600" />
            Registrar Nuevo Paciente
          </h1>
          <Link 
            href="/pacientes-listado"
            className="flex items-center text-gray-500 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al listado
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
            
            {/* Selector de Propietario (CRUCIAL) */}
            <div>
              <label htmlFor="propietarioId" className="block text-sm font-medium text-gray-700">
                Propietario <span className="text-red-500">*</span>
              </label>
              <select
                id="propietarioId"
                name="propietarioId"
                value={formData.propietarioId}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="" disabled>Seleccione un propietario...</option>
                {propietarios.length > 0 ? (
                  propietarios.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.nombre}</option>
                  ))
                ) : (
                  <option disabled>No hay propietarios cargados</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Paciente <span className="text-red-500">*</span></label>
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
              
              {/* Especie */}
              <div>
                <label htmlFor="especie" className="block text-sm font-medium text-gray-700">Especie <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="especie"
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Raza */}
              <div>
                <label htmlFor="raza" className="block text-sm font-medium text-gray-700">Raza</label>
                <input
                  type="text"
                  id="raza"
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Edad */}
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad (años)</label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Historial Médico */}
            <div>
              <label htmlFor="historialMedico" className="block text-sm font-medium text-gray-700">Historial Médico (Notas iniciales)</label>
              <textarea
                id="historialMedico"
                name="historialMedico"
                value={formData.historialMedico}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="text-right pt-4">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
