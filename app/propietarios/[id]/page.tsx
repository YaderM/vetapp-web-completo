"use client";

import { useEffect, useState } from 'react';
import MainLayout from '@/app/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Home, ArrowLeft, Edit, PawPrint } from 'lucide-react';

// Mock Data para simular la obtención de datos de la API
const mockPropietarios = {
  "prop-1001": { id: "prop-1001", nombre: "Ana", apellido: "García", email: "ana.garcia@mail.com", telefono: "555-1234", direccion: "Calle Sol 15", pacientes: [{id: 'pet-001', nombre: 'Max'}, {id: 'pet-002', nombre: 'Kiara'}] },
  "prop-1002": { id: "prop-1002", nombre: "Luis", apellido: "Martínez", email: "luis.m@mail.com", telefono: "555-5678", direccion: "Av. Luna 20", pacientes: [{id: 'pet-003', nombre: 'Toby'}] },
  // Agrega más mocks según sea necesario
};

/**
 * Componente para la visualización y edición de la ficha de un propietario específico.
 * Utiliza los `params` para obtener el ID de la URL.
 */
export default function FichaPropietarioPage({ params }: { params: { id: string } }) {
  const id = params?.id;
  const router = useRouter();
  const [propietario, setPropietario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos de la API
    setLoading(true);
    const data = (mockPropietarios as any)[id];

    setTimeout(() => {
      setPropietario(data);
      setLoading(false);
      
      // En un entorno real, si data fuera null, manejarías la ruta 404
      if (!data) {
        console.error(`Propietario con ID ${id} no encontrado.`);
        // Opcionalmente, redirigir a una página de error
      }
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8 text-center text-gray-500">Cargando ficha del propietario...</div>
      </MainLayout>
    );
  }

  if (!propietario) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-8">
          <p className="text-center text-red-500 text-xl">Error: Propietario no encontrado.</p>
          <button
            onClick={() => router.push('/propietarios')}
            className="mt-6 flex items-center justify-center mx-auto text-indigo-600 hover:text-indigo-800 transition duration-150"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Volver al Listado
          </button>
        </div>
      </MainLayout>
    );
  }

  const handleEdit = () => {
    // Lógica para ir a un formulario de edición (puede ser el mismo formulario 'crear' pero precargado)
    alert(`Redirigiendo a edición del propietario: ${propietario.nombre}`);
    // router.push(`/propietarios/editar/${id}`);
  };

  const handleGoToPatient = (patientId: string) => {
    // Lógica para ir a la ficha del paciente (Módulo 4)
    router.push(`/pacientes-ficha/${patientId}`);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <div className="flex items-start justify-between mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="w-8 h-8 mr-3 text-indigo-600" />
            Ficha del Propietario
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
              title="Editar Propietario"
            >
              <Edit className="w-5 h-5 mr-2" />
              Editar
            </button>
            <button
              onClick={() => router.push('/propietarios')}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150"
              title="Volver al Listado"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Volver
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <section className="border-b pb-4">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">Datos Generales</h2>
            <p className="text-4xl font-extrabold text-gray-900">{propietario.nombre} {propietario.apellido}</p>
          </section>

          {/* Contacto */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm">
              <Mail className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{propietario.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm">
              <Phone className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="text-lg font-medium text-gray-900">{propietario.telefono}</p>
              </div>
            </div>
          </section>

          {/* Dirección */}
          <section>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm">
              <Home className="w-6 h-6 text-indigo-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Dirección</p>
                <p className="text-lg font-medium text-gray-900">{propietario.direccion || "No especificada"}</p>
              </div>
            </div>
          </section>

          {/* Pacientes Asociados */}
          <section className="pt-4 border-t mt-6">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center">
              <PawPrint className="w-6 h-6 mr-2" />
              Mascotas a Cargo ({propietario.pacientes?.length || 0})
            </h2>
            <div className="space-y-3">
              {propietario.pacientes && propietario.pacientes.length > 0 ? (
                propietario.pacientes.map((paciente: any) => (
                  <div 
                    key={paciente.id} 
                    className="flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50 transition duration-150 cursor-pointer"
                    onClick={() => handleGoToPatient(paciente.id)}
                  >
                    <p className="text-lg font-medium text-gray-800">{paciente.nombre}</p>
                    <span className="text-sm text-indigo-600 font-medium hover:underline">Ver Ficha Médica &rarr;</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Este propietario no tiene mascotas registradas aún.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
