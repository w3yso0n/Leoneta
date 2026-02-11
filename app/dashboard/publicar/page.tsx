// app/dashboard/publicar/page.tsx
"use client"

import type React from "react"

import { MapRoute } from "@/components/dashboard/map-route"
import { PageHeader } from "@/components/dashboard/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, CheckCircle2, Clock, DollarSign, Loader2, MapPin, MapPinned, Navigation, Plus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { tripsApi, vehiclesApi, type ApiVehicle } from "@/lib/api"
import { toast } from "sonner"

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

  // ── Vehicle state ──
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    marca: "",
    modelo: "",
    anio: new Date().getFullYear().toString(),
    color: "",
    placas: "",
    capacidadPasajeros: "4",
  })

  // Load vehicles on mount
  useEffect(() => {
    async function loadVehicles() {
      setLoadingVehicles(true)
      try {
        const list = await vehiclesApi.getMyVehicles()
        const active = list.filter((v) => v.activo)
        setVehicles(active)
        if (active.length > 0) {
          const primary = active.find((v) => v.esPrincipal) || active[0]
          setSelectedVehicleId(primary.id)
        } else {
          setShowVehicleForm(true)
        }
      } catch {
        setShowVehicleForm(true)
      } finally {
        setLoadingVehicles(false)
      }
    }
    loadVehicles()
  }, [])

  const handleSaveVehicle = async () => {
    if (!vehicleForm.marca.trim() || !vehicleForm.modelo.trim() || !vehicleForm.color.trim()) {
      toast.error("Completa marca, modelo y color de tu vehículo")
      return
    }
    setSavingVehicle(true)
    try {
      const newVehicle = await vehiclesApi.create({
        marca: vehicleForm.marca.trim(),
        modelo: vehicleForm.modelo.trim(),
        anio: Number.parseInt(vehicleForm.anio),
        color: vehicleForm.color.trim(),
        placas: vehicleForm.placas.trim() || undefined,
        capacidadPasajeros: Number.parseInt(vehicleForm.capacidadPasajeros),
      })
      setVehicles((prev) => [...prev, newVehicle])
      setSelectedVehicleId(newVehicle.id)
      setShowVehicleForm(false)
      toast.success("¡Vehículo registrado!")
    } catch (error: any) {
      const msg = error?.data?.message || "Error al registrar el vehículo"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setSavingVehicle(false)
    }
  }

  // ── Trip form state ──
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
  const isEssentialComplete = (
    formData.origen.trim() !== "" &&
    formData.fecha !== "" &&
    formData.hora !== "" &&
    !!formData.precio && Number.parseFloat(formData.precio) > 0 &&
    !!formData.asientos && Number.parseInt(formData.asientos) >= 1 && Number.parseInt(formData.asientos) <= 4
  )

  const horaEnMinutos = () => {
    const ahora = new Date()
    return ahora.getHours() * 60 + ahora.getMinutes()
  }

  const formatoHora = (mins: number) => {
    const h = Math.floor(mins / 60) % 24
    const m = mins % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }

  const setHorarioRapido = (offsetMin: number) => {
    const minutosDestino = horaEnMinutos() + offsetMin
    setFormData({ ...formData, hora: formatoHora(minutosDestino) })
  }

  const sugerirPrecio = (valor: number) => setFormData({ ...formData, precio: String(valor) })

  const obtenerDireccionDesdeCoordenadas = async (lat: number, lng: number): Promise<string> => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      if (!token) return "Mi ubicación actual"
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,neighborhood,locality`
      )
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        return feature.place_name || feature.text || "Mi ubicación actual"
      }
    } catch (err) {
      // fallback
    }
    return "Mi ubicación actual"
  }

  const obtenerUbicacionActual = () => {
    setGeolocalizando(true)

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización")
      setGeolocalizando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const direccion = await obtenerDireccionDesdeCoordenadas(latitude, longitude)
        setFormData({ ...formData, origen: direccion })
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

    if (!selectedVehicleId) {
      toast.error("Selecciona un vehículo para publicar el viaje")
      return
    }

    setIsSubmitting(true)

    try {
      await tripsApi.create({
        vehiculoId: selectedVehicleId,
        origen: formData.origen,
        destino: CUCEI_ADDRESS,
        fecha: formData.fecha,
        hora: formData.hora,
        asientosTotales: Number.parseInt(formData.asientos),
        precio: Number.parseFloat(formData.precio),
        notas: formData.notas || undefined,
      })

      setShowSuccess(true)
      toast.success("¡Viaje publicado exitosamente!")

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
    } catch (error: any) {
      const msg = error?.data?.message || "Error al publicar el viaje"
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setIsSubmitting(false)
    }
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

      {/* ── Sección de vehículo ── */}
      {loadingVehicles ? (
        <Card className="p-6 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Cargando tus vehículos...</span>
        </Card>
      ) : (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-card-foreground flex items-center gap-2">
              <Car className="w-5 h-5" />
              Tu vehículo
            </h2>
            {vehicles.length > 0 && !showVehicleForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVehicleForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar otro
              </Button>
            )}
          </div>

          {/* Selector de vehículo existente */}
          {vehicles.length > 0 && !showVehicleForm && (
            <div className="space-y-2">
              {vehicles.length === 1 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <Car className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {vehicles[0].marca} {vehicles[0].modelo} ({vehicles[0].anio})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehicles[0].color} · {vehicles[0].capacidadPasajeros} pasajeros
                      {vehicles[0].placas ? ` · ${vehicles[0].placas}` : ""}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">Seleccionado</Badge>
                </div>
              ) : (
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.marca} {v.modelo} ({v.anio}) — {v.color}
                        {v.esPrincipal ? " ★" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Formulario de nuevo vehículo */}
          {showVehicleForm && (
            <div className="space-y-4">
              {vehicles.length === 0 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                  <Car className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                    Para publicar un viaje necesitas registrar tu vehículo. Solo toma un momento.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="v-marca" className="text-sm">
                    Marca <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v-marca"
                    placeholder="Ej: Toyota"
                    value={vehicleForm.marca}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, marca: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-modelo" className="text-sm">
                    Modelo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v-modelo"
                    placeholder="Ej: Corolla"
                    value={vehicleForm.modelo}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, modelo: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="v-anio" className="text-sm">Año</Label>
                  <Input
                    id="v-anio"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={vehicleForm.anio}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, anio: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-color" className="text-sm">
                    Color <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v-color"
                    placeholder="Ej: Gris"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-placas" className="text-sm">Placas</Label>
                  <Input
                    id="v-placas"
                    placeholder="ABC-123"
                    value={vehicleForm.placas}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, placas: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-capacidad" className="text-sm">Capacidad de pasajeros</Label>
                <Select
                  value={vehicleForm.capacidadPasajeros}
                  onValueChange={(v) => setVehicleForm({ ...vehicleForm, capacidadPasajeros: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "pasajero" : "pasajeros"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSaveVehicle}
                  disabled={savingVehicle || !vehicleForm.marca.trim() || !vehicleForm.modelo.trim() || !vehicleForm.color.trim()}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {savingVehicle ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Guardar vehículo
                    </>
                  )}
                </Button>
                {vehicles.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVehicleForm(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── Formulario del viaje (solo si tiene vehículo) ── */}
      {selectedVehicleId && !showVehicleForm && (
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

            {/* Destino fijo */}
            <div className="space-y-2">
              <Label className="text-sm">Destino</Label>
              <div className="relative">
                <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input value="CUCEI" disabled className="pl-9 text-sm bg-muted/50 cursor-not-allowed" />
              </div>
              <p className="text-xs text-muted-foreground">Todos los rides van a CUCEI</p>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {[15, 30, 45, 60].map((min) => (
                    <Button
                      key={min}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setHorarioRapido(min)}
                      className="h-8 px-3"
                    >
                      En {min} min
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Asientos y Precio */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="asientos" className="text-sm">
                  Asientos <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, asientos: String(Math.max(1, Number.parseInt(formData.asientos || "1") - 1)) })}
                  >
                    -
                  </Button>
                  <div className="relative flex-1">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, asientos: String(Math.min(4, Number.parseInt(formData.asientos || "1") + 1)) })}
                  >
                    +
                  </Button>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {[20, 30, 40].map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => sugerirPrecio(p)}
                      className="h-8 px-3"
                    >
                      Sugerir ${p}
                    </Button>
                  ))}
                </div>
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Destino: CUCEI</p>
                    <p className="text-muted-foreground text-xs">Blvd. Marcelino García Barragán 1421</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {formData.fecha && (
                    <Badge variant="outline" className="text-xs">{formData.fecha}</Badge>
                  )}
                  {formData.hora && (
                    <Badge variant="outline" className="text-xs">{formData.hora}</Badge>
                  )}
                  {!!formData.asientos && (
                    <Badge variant="outline" className="text-xs">{formData.asientos} asientos</Badge>
                  )}
                  {!!formData.precio && (
                    <Badge variant="outline" className="text-xs">${formData.precio} MXN</Badge>
                  )}
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
            disabled={isSubmitting || !isEssentialComplete}
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
        {!isEssentialComplete && (
          <p className="text-xs text-muted-foreground">Completa origen, fecha, hora, asientos y precio para publicar.</p>
        )}
      </form>
      )}
    </div>
  )
}
