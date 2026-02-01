"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Mail, Lock, ArrowLeft, Info, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const router = useRouter()
  const { login, user, isLoading: authLoading } = useAuth()

  // Si ya hay sesión, redirigir al dashboard
  if (user && typeof window !== "undefined") {
    router.replace("/dashboard")
  }

  // Validar que los campos estén llenos y el email sea válido
  const isFormValid = () => {
    if (!email || !password) return false
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@([^\s@]+)$/
    const match = email.match(emailRegex)
    if (!match) return false
    const domain = match[1].toLowerCase()
    const allowedDomains = ["academicos.udg.mx", "alumnos.udg.mx"]
    if (!allowedDomains.some((d) => domain === d)) return false
    
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
              {/* Botón de Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O continúa con correo
                  </span>
                </div>
              </div>

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
                    disabled={isLoading || authLoading}
                    autoComplete="username"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa tu correo institucional (@academicos.udg.mx o @alumnos.udg.mx)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading || authLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={remember} onCheckedChange={(c) => setRemember(!!c)} />
                  Mantener sesión iniciada
                </label>
                <Link 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || authLoading || !isFormValid()}>
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

