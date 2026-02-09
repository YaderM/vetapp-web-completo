// app/propietarios/editar/[id]/page.tsx
'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
// Importamos los servicios de propietario y los tipos
import { getPropietarioById, updatePropietario, type Propietario } from '@/app/services/propietario.service'; 
// ---------------------------------

import { User, CheckCircle, AlertTriangle, Loader2, ArrowLeft, Save } from 'lucide-react';

// --- Tipos de Datos (Deben coincidir con los de la API) ---
const initialFormState: Propietario = {
  id: 0,
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
};
// --- Fin de Tipos ---

export default function EditarPropietarioPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [formData, setFormData] = useState<Propietario>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // ----- ¡LA CORRECCIÓN ESTÁ AQUÍ! -----
  const [error, setError] = useState<string | null>(null);
  // -------------------------------------

  // 1. Fetch Inicial para precargar los datos
  const fetchPropietario = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      // Función real para obtener los datos del propietario por su ID
      const data = await getPropietarioById(id); 
      setFormData(data);
    } catch (err: any) {
      console.error('Error al cargar datos de edición:', err);
      // Usamos el estado message en lugar de error para el feedback del usuario
      setMessage({ type: 'error', text: 'No se pudo cargar el propietario para edición.' });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPropietario();
  }, [fetchPropietario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      setMessage({ type: 'error', text: 'Por favor, complete todos los campos obligatorios.' });
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

    try {
      // 3. Envío del formulario como actualización (PUT/PATCH)
      const data = await updatePropietario(id, formData); 

      setMessage({ type: 'success', text: `✅ Propietario ${data.nombre} actualizado exitosamente.` });
      
      // Redirigir a la ficha de visualización
      setTimeout(() => router.push(`/propietarios/${id}`), 1500);

    } catch (err: any) {
      console.error('Error de actualización:', err);
      setMessage({ type: 'error', text: err.message || 'Error desconocido al actualizar el propietario.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          Cargando datos del propietario...
        </div>
      </MainLayout>
    );
  }

  // Si no se encuentra el propietario después de cargar, o si hay un error fatal de carga
  if (error || (formData.id === 0 && !loading)) {
     return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-xl text-red-600 font-semibold">{error || `Error: Propietario con ID ${id} no encontrado.`}</p>
           <Link 
              href="/propietarios"
              className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al Listado
            </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4 flex items-center">
          <User className="w-7 h-7 mr-3 text-indigo-600" />
          Editar Propietario: {formData.nombre} {formData.apellido}
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

        {/* Formulario de Edición */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-lg">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            
            {/* Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido <span className="text-red-500">*</span></label>
              <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></label>
              <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link href={`/propietarios/${id}`} className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150 flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a la Ficha
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition duration-150"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Actualizando...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}