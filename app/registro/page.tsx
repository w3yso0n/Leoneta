"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Lock, User, GraduationCap, Info, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function RegistroPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "",
    terms: false,
  })
  
  const [emailError, setEmailError] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passwordStrength = useMemo(() => {
    const v = formData.password
    const lengthOK = v.length >= 8
    const upper = /[A-Z]/.test(v)
    const lower = /[a-z]/.test(v)
    const digit = /\d/.test(v)
    const special = /[^A-Za-z0-9]/.test(v)
    const score = [lengthOK, upper, lower, digit, special].filter(Boolean).length
    if (!v) return { label: "", color: "" }
    if (score <= 2) return { label: "Débil", color: "text-destructive" }
    if (score === 3 || score === 4) return { label: "Media", color: "text-yellow-600" }
    return { label: "Fuerte", color: "text-green-600" }
  }, [formData.password])

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("")
      setIsEmailValid(false)
      return
    }

    const validDomains = ["@alumnos.udg.mx", "@academicos.udg.mx"]
    const isValid = validDomains.some(domain => email.endsWith(domain))
    
    if (!isValid) {
      setEmailError("Debes usar tu correo institucional (@alumnos.udg.mx o @academicos.udg.mx)")
      setIsEmailValid(false)
    } else {
      setEmailError("")
      setIsEmailValid(true)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData({ ...formData, email })
    validateEmail(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isEmailValid) {
      setEmailError("Debes usar tu correo institucional (@alumnos.udg.mx o @academicos.udg.mx)")
      return
    }

    if (!formData.rol) {
      toast.error("Selecciona tu rol")
      return
    }

    const lengthOK = formData.password.length >= 8
    const hasUpper = /[A-Z]/.test(formData.password)
    const hasLower = /[a-z]/.test(formData.password)
    const hasDigit = /\d/.test(formData.password)
    if (!(lengthOK && hasUpper && hasLower && hasDigit)) {
      toast.error("La contraseña debe tener 8+ caracteres, mayúscula, minúscula y número")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (!formData.terms) {
      toast.error("Debes aceptar los términos y privacidad")
      return
    }
    setSubmitting(true)
    const rolValue = formData.rol as "estudiante" | "profesor"
    register({
      email: formData.email,
      password: formData.password,
      nombre: formData.nombre,
      apellido: formData.apellido,
      rol: rolValue,
    }).then((ok) => {
      if (!ok) {
        toast.error("Este correo ya está registrado")
        setSubmitting(false)
        return
      }
      setShowSuccess(true)
      toast.success("¡Registro exitoso!", {
        description: `Bienvenido ${formData.nombre} ${formData.apellido}. Tu cuenta ha sido creada.`,
        duration: 3000,
      })
      setTimeout(() => {
        router.push("/dashboard")
      }, 800)
    }).catch(() => {
      toast.error("Error al registrar. Intenta nuevamente")
      setSubmitting(false)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/abstract-university-pattern.png')] opacity-10 bg-cover bg-center" />
      
      <div className="w-full max-w-2xl relative z-10">
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

        {/* Card de Registro */}
        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
            <CardDescription className="text-center">
              Regístrate con tu correo institucional
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm mt-2">
                  <p className="font-semibold text-green-800 dark:text-green-300 mb-1">¡Registro exitoso!</p>
                  <p className="text-green-700 dark:text-green-400">
                    Bienvenido <strong>{formData.nombre} {formData.apellido}</strong>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                    Email: {formData.email} 
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-3 border-t border-green-300 dark:border-green-700 pt-2">
                    Hemos enviado un correo de confirmación a <strong>{formData.email}</strong>. Por favor, verifica tu bandeja de entrada y confirma tu cuenta para poder iniciar sesión.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      placeholder="Juan"
                      className="pl-10"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@alumnos.udg.mx"
                    className={`pl-10 ${emailError ? 'border-destructive focus-visible:ring-destructive' : isEmailValid ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                    value={formData.email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-destructive font-medium flex items-center gap-1">
                    {emailError}
                  </p>
                )}
                {isEmailValid && (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <span className="inline-block w-4 h-4">✓</span>
                    Correo institucional válido
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select 
                    value={formData.rol} 
                    onValueChange={(value) => setFormData({ ...formData, rol: value })}
                    required
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estudiante">Estudiante</SelectItem>
                      <SelectItem value="profesor">Profesor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button type="button" aria-label="Mostrar contraseña" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordStrength.label && (
                  <p className={`text-xs ${passwordStrength.color}`}>Seguridad: {passwordStrength.label}</p>
                )}
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, incluir mayúscula, minúscula y número.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <button type="button" aria-label="Mostrar confirmación" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword((v) => !v)}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="terms" type="checkbox" className="h-4 w-4" checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">Acepto los términos de servicio y la política de privacidad</Label>
              </div>

              <Button type="submit" className="w-full" disabled={!isEmailValid || submitting || isLoading}>
                {submitting ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Ir a Iniciar Sesión
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-primary-foreground/70 mt-6">
          Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  )
}

