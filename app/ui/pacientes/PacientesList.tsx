// app/ui/pacientes/PacientesList.tsx
'use client'; // 👈 Marcamos como Client Component

import { useState } from 'react';
import Link from 'next/link';
// Importamos los iconos que podríamos necesitar (ejemplo con un paquete popular como Lucide React)
// import { Search, Edit, Trash2, Eye } from 'lucide-react'; 

// Definición de tipos (deberían ser consistentes con los definidos en page.tsx)
interface Propietario {
  id: string;
  nombre: string;
  // ... otros campos
}

interface Paciente {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  propietario: Propietario;
  // ... otros campos
}

interface PacientesListProps {
  data: Paciente[];
}

export default function PacientesList({ data }: PacientesListProps) {
  // Estado para manejar la búsqueda de pacientes
  const [searchTerm, setSearchTerm] = useState('');
  // Nota: La paginación y filtros complejos se manejarían aquí

  // Lógica de filtrado simple
  const filteredPacientes = data.filter(paciente =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.propietario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Función de ejemplo para manejo de eliminación
  const handleEliminar = (pacienteId: string, pacienteNombre: string) => {
    // Requisito: Edición y eliminación con confirmación visual [cite: 16]
    if (window.confirm(`¿Estás seguro de que deseas eliminar al paciente "${pacienteNombre}"?`)) {
      console.log(`Eliminando paciente con ID: ${pacienteId}`);
      // Lógica de eliminación (ej: llamada a API REST con Axios/fetch) [cite: 28]
      // Después de la eliminación, se necesitaría revalidar los datos o actualizar el estado.
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      
      {/* Barra de Búsqueda y Filtros */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o propietario..."
          className="p-2 border border-gray-300 rounded-lg flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Aquí se añadirían los filtros (por especie, raza, etc.) */}
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
          Filtrar
        </button>
      </div>

      {/* Tabla de Listado de Pacientes */}
      <div className="overflow-x-auto">
        {filteredPacientes.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No se encontraron pacientes.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especie / Raza</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/pacientes/${paciente.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {paciente.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.especie} / {paciente.raza}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.propietario.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center space-x-2">
                    {/* Botón para ver Ficha Médica/Detalle */}
                    <Link href={`/pacientes/${paciente.id}`} title="Ver Ficha Médica">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded-full bg-blue-50">
                        {/* <Eye size={18} /> */} Ver
                      </button>
                    </Link>
                    {/* Botón para Editar */}
                    <Link href={`/pacientes/editar/${paciente.id}`} title="Editar Paciente">
                      <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full bg-yellow-50">
                        {/* <Edit size={18} /> */} Editar
                      </button>
                    </Link>
                    {/* Botón para Eliminar */}
                    <button
                      onClick={() => handleEliminar(paciente.id, paciente.nombre)}
                      title="Eliminar Paciente"
                      className="text-red-600 hover:text-red-900 p-1 rounded-full bg-red-50"
                    >
                      {/* <Trash2 size={18} /> */} Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Implementación simple de Paginación (requiere más lógica de estado) */}
      <div className="mt-4 flex justify-center space-x-2">
        {/* Aquí se añadirían los botones de paginación si se implementa */}
        {/* Requisito: Listado con búsqueda, filtros y paginación  */}
        {/* <PaginacionComponent /> */}
      </div>

    </div>
  );
}