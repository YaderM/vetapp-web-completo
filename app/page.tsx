'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Si la sesión está cargada y el usuario está autenticado, vamos al dashboard
    if (status === "authenticated") {
      router.push("/dashboard");
    } 
    // Si la sesión está cargada y NO está autenticado, vamos al login
    else if (status === "unauthenticated") {
      router.push("/login");
    }
    // Si está 'loading', no hacemos nada.
  }, [status, router]);

  if (status === "loading") {
    // Muestra un loader mientras NextAuth determina el estado
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-600">Verificando sesión...</p>
      </div>
    );
  }

  // Si la sesión ya se verificó y no se redirigió, no renderizamos nada
  return null;
}