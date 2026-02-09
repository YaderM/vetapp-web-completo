// app/components/Layout/MainLayout.tsx
'use client';

import { useState, ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
// Asumimos que lucide-react está instalado
import { Home, Users, PawPrint, LogOut, Menu, X, CalendarCheck, UserCircle } from "lucide-react"; 

// Definimos la estructura de un enlace de navegación
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeSegment: string;
}

// Actualicé los segmentos activos para que coincidan con tu estructura de carpetas
const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home, activeSegment: "/dashboard" },
  { name: "Propietarios", href: "/propietarios", icon: Users, activeSegment: "/propietarios" },
  { name: "Pacientes", href: "/pacientes-listado", icon: PawPrint, activeSegment: "/pacientes" }, 
  { name: "Citas", href: "/citas", icon: CalendarCheck, activeSegment: "/citas" },
  { name: "Mi Perfil", href: "/perfil", icon: UserCircle, activeSegment: "/perfil" },
];

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  // Componente para un solo enlace de navegación
  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname.startsWith(item.activeSegment);
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          router.push(item.href);
          setIsSidebarOpen(false); // Cierra el menú en móvil
        }}
        className={`flex items-center p-3 rounded-xl transition-all duration-200 w-full text-left font-medium ${
          isActive
            ? "bg-indigo-700 text-white shadow-lg"
            : "text-indigo-200 hover:bg-indigo-700/50 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {item.name}
      </button>
    );
  };

  // --- Sidebar Component ---
  const Sidebar = () => (
    <div 
      className={`fixed top-0 left-0 h-full w-64 bg-indigo-900 text-white p-6 flex flex-col z-50 transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:flex-shrink-0 md:shadow-xl md:shadow-indigo-900/10`}
    >
      
      {/* Logo y Botón de Cierre (Solo en Móvil) */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-extrabold text-white">VetApp 🐾</h1>
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="md:hidden text-indigo-200 hover:text-white"
          aria-label="Cerrar menú"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </nav>

      {/* Información de Usuario y Logout */}
      <div className="mt-auto pt-6 border-t border-indigo-700">
        <div className="flex items-center mb-4 p-2 rounded-lg bg-indigo-800">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm mr-3">
            {/* Usamos la inicial del nombre o 'A' de Admin */}
            {session?.user?.nombre ? session.user.nombre[0].toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className="font-semibold text-sm truncate">{session?.user?.nombre || 'Veterinario'}</p>
            
            {/* ----- ¡LA CORRECCIÓN FINAL ESTÁ AQUÍ! ----- */}
            {/* Simplemente mostramos el ID (que es un NÚMERO), sin .substring() */}
            <p className="text-xs text-indigo-300 truncate">ID: {session?.user?.id}</p>
            {/* ------------------------------------------- */}

          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-xl transition duration-200 w-full text-left font-medium text-red-300 hover:bg-red-700/50 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  // --- Main Content Component ---
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      {/* Overlay para cerrar en móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 w-full">
        {/* Header con botón de menú (Solo en Móvil) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-30">
          <h2 className="text-xl font-bold text-indigo-700">VetApp</h2>
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:text-indigo-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Contenido Principal de la Página */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}