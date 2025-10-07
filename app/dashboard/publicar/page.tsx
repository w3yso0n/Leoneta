"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, Users, DollarSign, CheckCircle2, Navigation, Loader2, MapPinned } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapRoute } from "@/components/dashboard/map-route"

const CUCEI_ADDRESS = "Blvd. Gral. Marcelino García Barragán 1421, Olímpica, 44430 Guadalajara, Jal."

interface FormData {
  origen: string
  fecha: string
  hora: string
  asientos: string
  precio: string
  notas: string
  preferencias: {
    noFumar: boolean
    musicaPermitida: boolean
    silencio: boolean
    equipajeLigero: boolean
    mascotasPermitidas: boolean
  }
}

export default function PublicarViajePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    origen: "",
    fecha: "",
    hora: "",
    asientos: "1",
    precio: "",
    notas: "",
    preferencias: {
      noFumar: false,
      musicaPermitida: false,
      silencio: false,
      equipajeLigero: false,
      mascotasPermitidas: false,
    },
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [geolocalizando, setGeolocalizando] = useState(false)

  const obtenerUbicacionActual = () => {
    setGeolocalizando(true)

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización")
      setGeolocalizando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({ ...formData, origen: "Mi ubicación actual" })
        setGeolocalizando(false)
      },
      (error) => {
        alert("No se pudo obtener tu ubicación")
        setGeolocalizando(false)
      }
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.origen.trim()) newErrors.origen = "Requerido"
    if (!formData.fecha) newErrors.fecha = "Requerida"
    else {
      const selectedDate = new Date(formData.fecha)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) newErrors.fecha = "Fecha inválida"
    }
    if (!formData.hora) newErrors.hora = "Requerida"
    if (!formData.asientos || Number.parseInt(formData.asientos) < 1 || Number.parseInt(formData.asientos) > 4) {
      newErrors.asientos = "Entre 1 y 4"
    }
    if (!formData.precio || Number.parseFloat(formData.precio) < 0) {
      newErrors.precio = "Precio inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)

      setFormData({
        origen: "",
        fecha: "",
        hora: "",
        asientos: "1",
        precio: "",
        notas: "",
        preferencias: {
          noFumar: false,
          musicaPermitida: false,
          silencio: false,
          equipajeLigero: false,
          mascotasPermitidas: false,
        },
      })

      setTimeout(() => {
        router.push("/dashboard/mis-viajes")
      }, 2000)
    }, 1000)
  }

  const handlePreferenciaChange = (key: keyof FormData["preferencias"]) => {
    setFormData({
      ...formData,
      preferencias: {
        ...formData.preferencias,
        [key]: !formData.preferencias[key],
      },
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Ofrecer viaje a CUCEI" />

      {/* Alerta informativa */}
      <Alert className="border-primary/20 bg-primary/5">
        <MapPinned className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">Destino automático:</span> Tu viaje llevará estudiantes a CUCEI
        </AlertDescription>
      </Alert>

      {showSuccess && (
        <Alert className="border-accent bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent-foreground text-sm">
            ¡Viaje publicado! Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Ubicación y horario */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-4 text-card-foreground">¿Desde dónde sales?</h2>

          <div className="space-y-4">
            {/* Origen */}
            <div className="space-y-2">
              <Label htmlFor="origen" className="text-sm">
                Tu punto de partida <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={obtenerUbicacionActual}
                  disabled={geolocalizando}
                  variant="outline"
                  size="sm"
                  className="sm:w-auto"
                >
                  {geolocalizando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Obteniendo...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Usar mi ubicación
                    </>
                  )}
                </Button>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="origen"
                    placeholder="Ej: Av. Patria 1500, Zapopan"
                    value={formData.origen}
                    onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                    className={`pl-9 text-sm ${errors.origen ? "border-destructive" : ""}`}
                  />
                </div>
              </div>
              {errors.origen && <p className="text-xs text-destructive">{errors.origen}</p>}
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha" className="text-sm">
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className={`text-sm ${errors.fecha ? "border-destructive" : ""}`}
                />
                {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora" className="text-sm">
                  Hora <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className={`text-sm ${errors.hora ? "border-destructive" : ""}`}
                />
                {errors.hora && <p className="text-xs text-destructive">{errors.hora}</p>}
              </div>
            </div>

            {/* Asientos y Precio */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="asientos" className="text-sm">
                  Asientos <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="asientos"
                    type="number"
                    min="1"
                    max="4"
                    value={formData.asientos}
                    onChange={(e) => setFormData({ ...formData, asientos: e.target.value })}
                    className={`pl-9 text-sm ${errors.asientos ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.asientos && <p className="text-xs text-destructive">{errors.asientos}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio" className="text-sm">
                  Precio (MXN) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="precio"
                    type="number"
                    min="0"
                    step="10"
                    placeholder="30"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className={`pl-9 text-sm ${errors.precio ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.precio && <p className="text-xs text-destructive">{errors.precio}</p>}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas" className="text-sm">Tu ruta (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Ej: Paso por Av. Patria y Av. Guadalupe"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={2}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">Ayuda a otros a saber si pasas cerca de ellos</p>
            </div>
          </div>
        </Card>

        {/* Mapa de ruta */}
        {formData.origen && (
          <Card className="p-0 overflow-hidden">
            <MapRoute 
              origin={formData.origen}
              destination={CUCEI_ADDRESS}
              height="300px"
              className="sm:h-[400px]"
            />
            <div className="p-3 sm:p-4 bg-muted/30 border-t">
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Destino: CUCEI</p>
                  <p className="text-muted-foreground text-xs">Blvd. Marcelino García Barragán 1421</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Preferencias */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-3 text-card-foreground">Preferencias del viaje</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noFumar"
                checked={formData.preferencias.noFumar}
                onCheckedChange={() => handlePreferenciaChange("noFumar")}
              />
              <Label htmlFor="noFumar" className="text-sm font-normal cursor-pointer">
                No fumar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="musicaPermitida"
                checked={formData.preferencias.musicaPermitida}
                onCheckedChange={() => handlePreferenciaChange("musicaPermitida")}
              />
              <Label htmlFor="musicaPermitida" className="text-sm font-normal cursor-pointer">
                Música
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="silencio"
                checked={formData.preferencias.silencio}
                onCheckedChange={() => handlePreferenciaChange("silencio")}
              />
              <Label htmlFor="silencio" className="text-sm font-normal cursor-pointer">
                Silencio
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="equipajeLigero"
                checked={formData.preferencias.equipajeLigero}
                onCheckedChange={() => handlePreferenciaChange("equipajeLigero")}
              />
              <Label htmlFor="equipajeLigero" className="text-sm font-normal cursor-pointer">
                Equipaje ligero
              </Label>
            </div>

            <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
              <Checkbox
                id="mascotasPermitidas"
                checked={formData.preferencias.mascotasPermitidas}
                onCheckedChange={() => handlePreferenciaChange("mascotasPermitidas")}
              />
              <Label htmlFor="mascotasPermitidas" className="text-sm font-normal cursor-pointer">
                Mascotas OK
              </Label>
            </div>
          </div>
        </Card>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-sm sm:text-base"
          >
            {isSubmitting ? "Publicando..." : "Ofrecer viaje"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            className="sm:w-auto text-sm sm:text-base"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
