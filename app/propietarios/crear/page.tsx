// app/propietarios/crear/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ----- ¡CORRECCIÓN DE RUTAS! -----
import MainLayout from '@/app/components/Layout/MainLayout';
// Importamos el servicio y el tipo de datos
import { createPropietario, type NuevoPropietario } from '@/app/services/propietario.service'; 
// ---------------------------------

import { User, CheckCircle, AlertTriangle, Loader2, Save, ArrowLeft } from 'lucide-react';

const initialFormState: NuevoPropietario = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
};

export default function CrearPropietarioPage() {
  const [formData, setFormData] = useState<NuevoPropietario>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) {
      setMessage({ type: 'error', text: 'Por favor, complete todos los campos obligatorios (Nombre, Apellido, Email, Teléfono).' });
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

    setLoading(true);

    try {
      const data = await createPropietario(formData);

      setMessage({ type: 'success', text: `✅ Propietario ${data.nombre} ${data.apellido} registrado exitosamente.` });
      setFormData(initialFormState); // Limpiar el formulario

      // Redirigir de vuelta al listado después de 1.5 segundos
      setTimeout(() => {
        router.push('/propietarios');
      }, 1500);

    } catch (err: any) {
      console.error('Error de registro:', err);
      setMessage({ type: 'error', text: err.message || 'Error desconocido al registrar al propietario.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <User className="w-7 h-7 mr-3 text-indigo-600" />
            Registrar Nuevo Propietario
            </h1>
            
            {/* ----- CORRECCIÓN DE 'legacyBehavior' ----- */}
            <Link 
                href="/propietarios"
                className="flex items-center text-gray-500 hover:text-indigo-600"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al listado
            </Link>
            {/* ------------------------------------------- */}
        </div>


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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-4">
            {/* ----- CORRECCIÓN DE 'legacyBehavior' (Botón Cancelar) ----- */}
            <Link 
              href="/propietarios"
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
            >
              Cancelar
            </Link>
            {/* ------------------------------------------- */}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition duration-150"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Guardar Propietario</>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}