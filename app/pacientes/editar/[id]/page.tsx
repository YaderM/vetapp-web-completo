// app/pacientes/editar/[id]/page.tsx
'use client'; 

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint, User, CheckCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
// Asumiendo estos servicios:
import { getPacienteById, updatePaciente } from '@/services/paciente.service'; 
import { getPropietarios } from '@/services/propietario.service';
import MainLayout from '@/components/Layout/MainLayout';

// --- Tipos de Datos ---
interface PropietarioInfo {
  id: string;
  nombre: string;
  apellido: string;
}

interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number | ''; 
  historialMedico: string;
  propietarioId: string; // ID del propietario para el formulario
}

// Interfaz para la lista de propietarios a seleccionar
interface SelectPropietario {
    id: string;
    nombre: string;
}

// --- Fin de Tipos ---

export default function EditarPacientePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [formData, setFormData] = useState<Paciente>({
    id: '', nombre: '', especie: '', raza: '', edad: '', historialMedico: '', propietarioId: ''
  });
  const [propietarios, setPropietarios] = useState<SelectPropietario[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch de datos del Paciente y lista de Propietarios
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // a) Obtener lista de propietarios para el select
        const propData = await getPropietarios();
        setPropietarios(propData.map((p: any) => ({ 
            id: p.id, 
            nombre: `${p.nombre} ${p.apellido}` 
        })));

        // b) Obtener datos del paciente actual para precarga
        const pacienteData = await getPacienteById(id);

        // Mapear los datos de la API al estado del formulario, extrayendo el ID del propietario
        setFormData({
            id: pacienteData.id,
            nombre: pacienteData.nombre,
            especie: pacienteData.especie,
            raza: pacienteData.raza,
            edad: pacienteData.edad,
            historialMedico: pacienteData.historialMedico,
            propietarioId: pacienteData.propietario.id, // Asume que la API devuelve el propietario.id anidado
        });

      } catch (err: any) {
        console.error('Error al cargar datos de edición:', err);
        setMessage({ type: 'error', text: 'No se pudo cargar el paciente o la lista de propietarios.' });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nombre || !formData.especie || !formData.propietarioId) {
      setMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Preparar los datos (Asegurar que la edad sea un número o null)
    const dataToSend = {
      ...formData,
      edad: formData.edad === '' ? null : Number(formData.edad),
    };

    try {
      // Envío de la actualización (PUT/PATCH)
      const data = await updatePaciente(id, dataToSend); 

      setMessage({ type: 'success', text: `✅ Paciente ${data.nombre} actualizado exitosamente.` });
      
      // Redirigir a la ficha de visualización
      setTimeout(() => router.push(`/pacientes/${id}`), 1500);

    } catch (err: any) {
      console.error('Error de actualización:', err);
      setMessage({ type: 'error', text: err.message || 'Error desconocido al actualizar el paciente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center h-96 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="ml-4 text-xl text-gray-700">Cargando datos del paciente...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4 flex items-center">
          <PawPrint className="w-7 h-7 mr-3 text-indigo-600" />
          Editar Paciente: {formData.nombre}
        </h1>

        {/* Mensajes de feedback */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-lg">
          
          {/* Campo Propietario Asociado (IMPORTANTE: Relación uno-a-muchos) */}
          <div>
            <label htmlFor="propietarioId" className="block text-sm font-medium text-gray-700 mb-1">
              Propietario Asociado <span className="text-red-500">*</span>
            </label>
            <select
              id="propietarioId"
              name="propietarioId"
              value={formData.propietarioId}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>Selecciona un propietario</option>
              {propietarios.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.nombre}</option>
              ))}
            </select>
          </div>

          {/* Campos de Paciente (Mascota) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            {/* Especie */}
            <div>
              <label htmlFor="especie" className="block text-sm font-medium text-gray-700 mb-1">Especie <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Raza */}
            <div>
              <label htmlFor="raza" className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input
                type="text"
                id="raza"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Edad */}
            <div>
              <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">Edad (años)</label>
              <input
                type="number"
                id="edad"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Historial Médico */}
          <div>
            <label htmlFor="historialMedico" className="block text-sm font-medium text-gray-700 mb-1">
              Historial Médico Inicial / Notas
            </label>
            <textarea
              id="historialMedico"
              name="historialMedico"
              rows={4}
              value={formData.historialMedico}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link href={`/pacientes/${id}`} passHref>
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a la Ficha
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition duration-150"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}