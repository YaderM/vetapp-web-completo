// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ----- ¡LA CORRECCIÓN FINAL ESTÁ AQUÍ! -----
// Ya que tsconfig.json "@/*" apunta a la raíz "./*",
// debemos incluir "app/" en la ruta de importación.
import MainLayout from "@/app/components/Layout/MainLayout"; 
// ------------------------------------------

import { Home, Users, PawPrint } from 'lucide-react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirigir si no está autenticado (Ruta Protegida)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading" || !session) { // Añadimos chequeo de !session
        return (
            <div className="flex justify-center items-center min-h-screen text-xl text-indigo-600">
                Cargando sesión...
            </div>
        );
    }

    const userName = session.user?.nombre || session.user?.email?.split('@')[0] || "Usuario Veterinario";
    
    // Función de logout
    const handleLogout = () => {
        signOut({ callbackUrl: "/login" }); 
    };

    return (
        <MainLayout>
            <main className="flex-1 p-4 md:p-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <Home className="w-8 h-8 mr-3 text-indigo-600" />
                    Panel Principal de Gestión
                </h1>
                <p className="text-2xl text-gray-700">
                    ¡Bienvenido/a, **{userName}**!
                </p>
                
                {/* Indicadores visuales de sesión activa */}
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm max-w-lg">
                    <p className="font-semibold text-indigo-700">
                        ✅ Sesión Activa
                    </p>
                    <p className="text-sm text-gray-500">
                        ID de Usuario: {session.user.id} | Email: {session.user.email}
                    </p>
                </div>

                <div className="mt-12 space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 border-b pb-3">
                        Acceso Rápido a Módulos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Tarjeta Propietarios */}
                        <div 
                            onClick={() => router.push("/propietarios")} 
                            className="p-6 bg-white rounded-xl shadow-xl border-t-4 border-indigo-600 hover:shadow-2xl transition duration-300 cursor-pointer transform hover:scale-[1.02]"
                        >
                            <Users className="w-10 h-10 mb-3 text-indigo-600" />
                            <h3 className="text-xl font-bold text-gray-900">
                                Gestión de Propietarios
                            </h3>
                            <p className="text-gray-500 mt-1">
                                Registrar, listar y editar clientes.
                            </p>
                        </div>

                        {/* Tarjeta Pacientes */}
                        <div 
                            onClick={() => router.push("/pacientes-listado")} 
                            className="p-6 bg-white rounded-xl shadow-xl border-t-4 border-green-600 hover:shadow-2xl transition duration-300 cursor-pointer transform hover:scale-[1.02]"
                        >
                            <PawPrint className="w-10 h-10 mb-3 text-green-600" />
                            <h3 className="text-xl font-bold text-gray-900">
                                Gestión de Pacientes
                            </h3>
                            <p className="text-gray-500 mt-1">
                                Fichas médicas, historial y mascotas.
                            </p>
                        </div>
                        
                        {/* Tarjeta Citas */}
                        <div 
                            onClick={() => router.push("/citas")} 
                            className="p-6 bg-white rounded-xl shadow-xl border-t-4 border-yellow-600 hover:shadow-2xl transition duration-300 cursor-pointer transform hover:scale-[1.02]"
                        >
                            {/* Asumiendo que 'lucide-react' tiene CalendarCheck o similar */}
                            <PawPrint className="w-10 h-10 mb-3 text-yellow-600" /> 
                            <h3 className="text-xl font-bold text-gray-900">
                                Agenda de Citas
                            </h3>
                            <p className="text-gray-500 mt-1">
                                Programar, editar y visualizar el calendario.
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </MainLayout>
    );
}