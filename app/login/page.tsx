"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Mail, Lock, ArrowLeft, Info } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  // Validar que los campos estén llenos y el email sea válido
  const isFormValid = () => {
    if (!email || !password) return false
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return false
    
    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) return false
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Correo o contraseña incorrectos")
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/abstract-university-pattern.png')] opacity-10 bg-cover bg-center" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground text-sm">Volver al inicio</span>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image 
              src="/logos/udg.png" 
              alt="Universidad de Guadalajara" 
              width={48} 
              height={48}
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-4xl font-bold text-primary-foreground">Leoneta</h1>
          </div>
          <p className="text-primary-foreground/90">Carpooling Universitario</p>
        </div>

        {/* Card de Login */}
        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa con tu correo institucional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@academicos.udg.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !isFormValid()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Información de usuarios de prueba */}
            <Alert className="mt-6 bg-accent/10 border-accent">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm space-y-2 mt-2">
                <p className="font-semibold text-black dark:text-white">Usuarios de prueba:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Email:</strong> juan.perez@academicos.udg.mx</p>
                  <p><strong>Email:</strong> maria.gonzalez@academicos.udg.mx</p>
                  <p><strong>Email:</strong> carlos.martinez@academicos.udg.mx</p>
                  <p className="mt-2"><strong>Contraseña:</strong> demo123</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="mt-6 text-center space-y-2">
              <Link 
                href="/registro" 
                className="text-sm text-primary hover:underline block"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
              <Link 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-primary-foreground/70 mt-6">
          Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  )
}

