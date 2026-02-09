// app/api/auth/[...nextauth]/route.ts
// ESTA ES LA SOLUCIÓN DEFINITIVA Y ESTABLE

import NextAuth from 'next-auth';
// Importamos SÓLO las opciones de configuración (el objeto)
// Asumiendo que tu tsconfig.json tiene "@/*": ["./*"]
import { authOptions } from '@/auth/auth'; 

// Creamos el handler (manejador) en este archivo usando las opciones importadas
const handler = NextAuth(authOptions);

// Exportamos los métodos GET y POST que el App Router necesita
export { handler as GET, handler as POST };