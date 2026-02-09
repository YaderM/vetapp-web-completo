// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// Importamos el CSS global (ahora está directamente en app/globals.css)
import './globals.css'; 
// Importamos Providers (ahora está directamente en app/Providers.tsx)
import Providers from './Providers'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema Veterinario',
  description: 'Gestión de clínica veterinaria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}