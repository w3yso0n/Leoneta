import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Leoneta - Carpooling Universitario UDG',
  description: 'Plataforma de carpooling para la comunidad universitaria de la Universidad de Guadalajara. Comparte viajes, ahorra dinero y cuida el planeta.',
  generator: 'PikaFresas',
  icons: {
    icon: '/logos/udg.png',
    apple: '/logos/udg.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
