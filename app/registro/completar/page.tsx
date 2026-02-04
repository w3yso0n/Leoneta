"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, GraduationCap, Phone, MapPin, User } from "lucide-react"
import { toast } from "sonner"

const CARRERAS_UDG = [
  "Ingeniería en Computación",
  "Ingeniería en Software",
  "Ingeniería Civil",
  "Ingeniería Industrial",
  "Licenciatura en Derecho",
  "Medicina",
  "Arquitectura",
  "Administración",
  "Contaduría",
  "Psicología",
  "Diseño Gráfico",
  "Otra",
];

export default function CompletarRegistroPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    carrera: "",
    telefono: "",
    direccion: "",
    acerca_de: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carrera || !formData.telefono || !formData.direccion) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/usuarios/completar-registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al completar el registro");
      }

      toast.success("¡Registro completado exitosamente!");
      
      // Actualizar la sesión de NextAuth
      await update();
      
      // Redirigir al dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Error al completar el registro. Intenta de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/abstract-university-pattern.png')] opacity-10 bg-cover bg-center" />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="/logos/udg.png" 
              alt="Universidad de Guadalajara" 
              width={48} 
              height={48}
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-4xl font-bold text-primary-foreground">Leoneta</h1>
          </div>
          <p className="text-primary-foreground/90">Completa tu perfil</p>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              ¡Bienvenido {session?.user?.name}!
            </CardTitle>
            <CardDescription className="text-center">
              Completa tu información para empezar a usar Leoneta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-6 bg-accent/10 border-accent">
              <User className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm mt-2">
                <p className="font-semibold">Tu información básica:</p>
                <p className="text-xs mt-1">Email: {session?.user?.email}</p>
                <p className="text-xs">Nombre: {session?.user?.name}</p>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Carrera */}
              <div className="space-y-2">
                <Label htmlFor="carrera">
                  Carrera <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select 
                    value={formData.carrera}
                    onValueChange={(value) => setFormData({ ...formData, carrera: value })}
                    required
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecciona tu carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRERAS_UDG.map((carrera) => (
                        <SelectItem key={carrera} value={carrera}>
                          {carrera}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="33 1234 5678"
                    className="pl-10"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Los pasajeros necesitarán contactarte
                </p>
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">
                  Dirección <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="direccion"
                    placeholder="Calle, colonia, ciudad"
                    className="pl-10"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Esto nos ayuda a sugerir viajes cercanos a ti
                </p>
              </div>

              {/* Acerca de ti */}
              <div className="space-y-2">
                <Label htmlFor="acerca_de">
                  Acerca de ti (opcional)
                </Label>
                <Textarea
                  id="acerca_de"
                  placeholder="Cuéntanos un poco sobre ti, tus intereses, etc."
                  rows={4}
                  value={formData.acerca_de}
                  onChange={(e) => setFormData({ ...formData, acerca_de: e.target.value })}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.acerca_de.length}/500 caracteres
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.carrera || !formData.telefono || !formData.direccion}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Completar Registro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
