'use client'; 

import { useState, FormEvent, useEffect, use } from 'react'; // Agregamos 'use'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint, User, CheckCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { getPacienteById, updatePaciente } from '@/services/paciente.service'; 
import { getPropietarios } from '@/services/propietario.service';
import MainLayout from '@/components/Layout/MainLayout';

// --- Tipos de Datos ---
interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number | ''; 
  historialMedico: string;
  propietarioId: string; 
}

interface SelectPropietario {
    id: string;
    nombre: string;
}

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  // CORRECCIÓN NEXT.JS 15+: Desempaquetamos params con 'use'
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();

  const [formData, setFormData] = useState<Paciente>({
    id: '', nombre: '', especie: '', raza: '', edad: '', historialMedico: '', propietarioId: ''
  });
  const [propietarios, setPropietarios] = useState<SelectPropietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Cargar propietarios
        const propData = await getPropietarios();
        setPropietarios(propData.map((p: any) => ({ 
            id: String(p.id), // Aseguramos ID como String
            nombre: `${p.nombre} ${p.apellido}` 
        })));

        // 2. Cargar datos del paciente
        const pacienteData = await getPacienteById(id);

        setFormData({
            id: String(pacienteData.id), // CORRECCIÓN: number a string
            nombre: pacienteData.nombre,
            especie: pacienteData.especie,
            raza: pacienteData.raza,
            edad: pacienteData.edad,
            historialMedico: pacienteData.historialMedico,
            // CORRECCIÓN: Acceso seguro al ID del propietario
            propietarioId: String(pacienteData.propietario?.id || ''), 
        });

      } catch (err: any) {
        console.error('Error al cargar datos de edición:', err);
        setMessage({ type: 'error', text: 'No se pudo cargar el paciente.' });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.nombre || !formData.especie || !formData.propietarioId) {
      setMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios.' });
      return;
    }

    setIsSubmitting(true);
    
    const dataToSend = {
      ...formData,
      edad: formData.edad === '' ? null : Number(formData.edad),
      // Enviamos el ID como número si tu API así lo requiere, 
      // si no, déjalo como está.
      propietarioId: Number(formData.propietarioId) 
    };

    try {
      const data = await updatePaciente(id, dataToSend); 
      setMessage({ type: 'success', text: `✅ Paciente actualizado exitosamente.` });
      setTimeout(() => router.push(`/pacientes/${id}`), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center h-96 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <PawPrint className="w-7 h-7 mr-3 text-indigo-600" />
          Editar Paciente
        </h1>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-xl rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Propietario Asociado *</label>
            <select
              name="propietarioId"
              value={formData.propietarioId}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona un propietario</option>
              {propietarios.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
              <input name="especie" value={formData.especie} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-white bg-indigo-600 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}