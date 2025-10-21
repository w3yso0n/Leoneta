"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Lock, User, GraduationCap, Info } from "lucide-react"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "",
  })

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
            {/* Información de Demo */}
            <Alert className="mb-6 bg-accent/10 border-accent">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm mt-2">
                <p className="font-semibold text-accent-foreground mb-2">Modo Demo</p>
                <p>El registro estará disponible próximamente. Por ahora, usa los usuarios de prueba en la pantalla de login.</p>
              </AlertDescription>
            </Alert>

            <form className="space-y-4 opacity-50 pointer-events-none">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      placeholder="Juan"
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    disabled
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
                    placeholder="usuario@academicos.udg.mx"
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select disabled>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estudiante">Estudiante</SelectItem>
                      <SelectItem value="profesor">Profesor</SelectItem>
                      <SelectItem value="personal">Personal Administrativo</SelectItem>
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
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled>
                Crear Cuenta
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
          Al registrarte, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  )
}

