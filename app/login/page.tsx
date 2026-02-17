'use client';

import { useState, useEffect, Suspense } from "react"; 
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; 
import Link from "next/link";
import { Loader2 } from "lucide-react";

function LoginForm() {
    const [email, setEmail] = useState("admin@vetapp.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const searchParams = useSearchParams();
    
    // CORRECCIÓN AQUÍ: Agregamos el '?' antes del .get
    const authError = searchParams?.get('error');

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
            const result = await signIn("credentials", {
                email,
                password,
                redirect: true,
                callbackUrl: '/dashboard'
            });

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

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 rounded-md shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center items-center"
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

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-indigo-600 font-medium animate-pulse">Cargando...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}