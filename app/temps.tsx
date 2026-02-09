"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Importa el layout principal que debe existir en "@/components/Layout/MainLayout"
import MainLayout from "@/components/Layout/MainLayout"; 
// Importa el servicio de pacientes que debe existir en "@/services/paciente.service"
import { Paciente, getPacientes } from "@/services/paciente.service";
import { Plus, Search, Eye } from "lucide-react";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Función para cargar los datos desde la API
  const fetchPacientes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Se asume que el servicio usa la instancia de Axios con el token de sesión.
      const data = await getPacientes(); 
      setPacientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar pacientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  // Filtrado de la lista basado en la búsqueda
  const filteredPacientes = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.especie.toLowerCase().includes(searchQuery.toLowerCase()) ||
    // Asegurarse de que el propietario exista antes de acceder a sus propiedades
    (p.propietario?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.propietario?.apellido || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navegar a la ficha médica individual
  const viewFichaMedica = (id: string) => {
    // Redirige a la ruta dinámica: /pacientes/ID_DEL_PACIENTE
    router.push(`/pacientes/${id}`);
  };

  return (
    <MainLayout>
      <div className="bg-white p-6 rounded-xl shadow-2xl min-h-[80vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-indigo-700">
            Listado de Pacientes Veterinarios 🐶
          </h2>
          <button
            onClick={() => router.push("/pacientes/crear")}
            className="flex items-center py-2 px-4 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-150"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Paciente
          </button>
        </div>

        {/* Barra de Búsqueda */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, especie o propietario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Manejo de Estados */}
        {loading && (
          <div className="p-8 text-center text-lg text-indigo-600">
            Cargando datos de pacientes...
          </div>
        )}
        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-lg border border-red-300">
            Error al cargar: {error}
          </div>
        )}
        {!loading && filteredPacientes.length === 0 && (
          <div className="p-8 text-center text-lg text-gray-500">
            No se encontraron pacientes.
          </div>
        )}

        {/* Tabla de Pacientes */}
        {!loading && filteredPacientes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especie / Raza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad (años)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPacientes.map((p) => (
                  <tr key={p._id} className="hover:bg-indigo-50 transition duration-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.especie} / {p.raza}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Usamos el encadenamiento opcional (?) en caso de que la relación no esté cargada */}
                      {p.propietario?.nombre} {p.propietario?.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.edad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        title="Ver Ficha Médica"
                        onClick={() => viewFichaMedica(p._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded-full hover:bg-indigo-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Enlaces de edición/eliminación se añadirán más tarde */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
