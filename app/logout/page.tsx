"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Ajusta esta ruta si es necesario (debe apuntar a tu servicio AuthService)
import { logout } from '../services/auth/AuthService'; 

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Ejecutar la lógica de cerrar sesión
    logout();
    
    // 2. Redirigir al login
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Cerrando sesión...</p>
    </div>
  );
}