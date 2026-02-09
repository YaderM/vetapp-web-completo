// app/pacientes/nuevo/page.tsx
'use client'; // Necesitamos hooks para el formulario, por lo que es un Client Component

import { useState, FormEvent } from 'react';
import Link from 'next/link';

// Definición de tipos de datos para el nuevo paciente (simplificado)
interface NuevoPaciente {
  nombre: string;
  especie: string;
  raza: string;
  edad: number | ''; // Puede ser string vacío para el input
  historialMedico: string;
  propietarioId: string | ''; // Necesitamos asociar un propietario existente
}

// Valores iniciales del formulario
const initialFormState: NuevoPaciente = {
  nombre: '',
  especie: '',
  raza: '',
  edad: '',
  historialMedico: '',
  propietarioId: '',
};

export default function NuevoPacientePage() {
  const [formData, setFormData] = useState<NuevoPaciente>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // NOTA IMPORTANTE: En un proyecto real, necesitarías OBTENER la lista de propietarios
  // para llenar un <select> o un componente de búsqueda. 
  // Por ahora, usamos un placeholder.
  const propietariosPlaceholder = [
    { id: '1', nombre: 'Juan Pérez' },
    { id: '2', nombre: 'María García' },
    // ... datos reales obtenidos de la API
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Requisito: Validación robusta y asegurar integridad de datos [cite: 6, 24]
    if (!formData.nombre || !formData.especie || !formData.propietarioId) {
      setMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios.' });
      setLoading(false);
      return;
    }
    
    // Preparar los datos para el envío
    const dataToSend = {
      ...formData,
      edad: formData.edad === '' ? null : Number(formData.edad), // Asegurar que sea número o null
    };

    try {
      // Requisito: Consumo de API con manejo de errores y loading states [cite: 28]
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pacientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Aquí iría el token de autenticación
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        // Asumiendo que la API devuelve un error detallado
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el paciente.');
      }

      setMessage({ type: 'success', text: '✅ Paciente registrado exitosamente.' });
      setFormData(initialFormState); // Limpiar el formulario
      
    } catch (error) {
      console.error('Error de registro:', error);
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">
        Registro de Nuevo Paciente
      </h1>

      {/* Mensajes de feedback */}
      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Propietario Asociado (Requisito: Relación uno-a-muchos)  */}
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
            {propietariosPlaceholder.map(prop => (
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
            Historial Médico Inicial <span className="text-gray-400">(Opcional)</span>
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
          <Link href="/pacientes">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}