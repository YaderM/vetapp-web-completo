'use client';

import { useState, FormEvent, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ----- IMPORTACIONES DE SERVICIOS Y COMPONENTES -----
import MainLayout from '@/app/components/Layout/MainLayout';
import { getPropietarioById, updatePropietario, type Propietario } from '@/app/services/propietario.service';
import { User, CheckCircle, AlertTriangle, Loader2, Save, ArrowLeft } from 'lucide-react';

// CORRECCIÓN CLAVE: El ID debe ser un string vacío para que TypeScript no se queje
const initialFormState: Propietario = {
  id: '', 
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
};

export default function EditarPropietarioPage({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos el ID de los params (Requerido en Next.js 15)
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();

  const [formData, setFormData] = useState<Propietario>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Cargar datos al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getPropietarioById(id);
        
        // Nos aseguramos de que el ID sea string al llenar el formulario
        setFormData({
          ...data,
          id: String(data.id)
        });
      } catch (err: any) {
        console.error('Error:', err);
        setMessage({ type: 'error', text: 'No se pudo cargar la información del propietario.' });
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      await updatePropietario(id, formData);
      setMessage({ type: 'success', text: '✅ Propietario actualizado exitosamente.' });
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/propietarios');
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <User className="w-7 h-7 mr-3 text-indigo-600" />
            Editar Propietario
          </h1>
          <Link href="/propietarios" className="text-gray-500 hover:text-indigo-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Link>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido *</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center">
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}