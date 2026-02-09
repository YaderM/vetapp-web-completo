// app/login/page.tsx
'use client';

// ----- ¡LA CORRECCIÓN ESTÁ AQUÍ! -----
// Añadimos 'useEffect' a la importación de React
import { useState, useEffect } from "react"; 
// -------------------------------------

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; 
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("admin@vetapp.com"); // Pre-cargamos el admin
    const [password, setPassword] = useState("password123"); // Pre-cargamos la clave
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Leemos el ?error= de la URL (si NextAuth falla, nos envía aquí)
    const searchParams = useSearchParams();
    const authError = searchParams.get('error');

    // Usamos useEffect para mostrar el error si NextAuth nos redirige aquí
    useEffect(() => {
        if (authError === "CredentialsSignin") {
            setError("Credenciales incorrectas. Verifique el email y la contraseña.");
        } else if (authError) {
            setError("Ocurrió un error inesperado al iniciar sesión.");
        }
    }, [authError]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Dejamos que NextAuth maneje la redirección
            const result = await signIn("credentials", {
                email,
                password,
                callbackUrl: '/dashboard' // Le decimos que vaya al dashboard al éxito
            });

            // Si el signIn falla (ej. error de red), 'result.error' tendrá un valor
            if (result?.error) {
                setError("Error de red o el servidor no responde.");
                setLoading(false);
            }
            
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("Ocurrió un error inesperado.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700">
                    VetApp | Iniciar Sesión
                </h2>

                {/* Mostramos el error de 'CredentialsSignin' o de red */}
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    ¿No tienes cuenta? 
                    <Link href="/registro" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                        Regístrate
                    </Link>
                </p>
            </div>
        </div>
    );
}