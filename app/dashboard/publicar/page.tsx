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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Car, CheckCircle2, Clock, DollarSign, Loader2, MapPin, MapPinned, Navigation, Plus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { tripsApi, vehiclesApi, type ApiVehicle } from "@/lib/api"
import { toast } from "sonner"

const CUCEI_ADDRESS = "Blvd. Gral. Marcelino García Barragán 1421, Olímpica, 44430 Guadalajara, Jal."

/** Coordenadas aproximadas de CUCEI (Guadalajara) */
const CUCEI_LAT = 20.653922
const CUCEI_LNG = -103.324608

type RutaPunto = { lat: number; lng: number }

/** 50 puntos en línea recta entre origen y destino (matching por cercanía / densidad en backend). */
function interpolarRutaLineal50(
  origenLatVal: number,
  origenLngVal: number,
  destinoLatVal: number,
  destinoLngVal: number,
): RutaPunto[] {
  const steps = 50
  const puntos: RutaPunto[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const lat = origenLatVal + (destinoLatVal - origenLatVal) * t
    const lng = origenLngVal + (destinoLngVal - origenLngVal) * t
    puntos.push({ lat, lng })
  }
  return puntos
}

async function obtenerRutaReal(
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number,
): Promise<RutaPunto[] | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!token) return null
  try {
    const path = `${origenLng},${origenLat};${destinoLng},${destinoLat}`
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${path}?geometries=geojson&overview=full&access_token=${token}`
    const response = await fetch(url)
    const data = await response.json()
    if (data.routes?.length > 0) {
      const coordinates = data.routes[0].geometry?.coordinates as [number, number][] | undefined
      if (!Array.isArray(coordinates) || coordinates.length === 0) return null
      return coordinates.map(([lng, lat]) => ({ lat, lng }))
    }
  } catch {
    return null
  }
  return null
}

/** Muestreo a ~100 puntos si la ruta de calles trae muchos vértices (matching por cercanía / payload). */
function reducirRuta(ruta: RutaPunto[]): RutaPunto[] {
  if (ruta.length <= 100) return ruta

  const cada = Math.ceil(ruta.length / 100)

  const out = ruta.filter((_, i) => i % cada === 0)

  const last = ruta[ruta.length - 1]
  const end = out[out.length - 1]

  if (!end || end.lat !== last.lat || end.lng !== last.lng) {
    out.push(last)
  }

  return out
}

/** Misma lógica que al publicar: Directions (calles) → lineal 50 → reducir si hace falta. */
async function computeRutaFinalParaViaje(
  oLat: number,
  oLng: number,
  dLat: number,
  dLng: number,
): Promise<RutaPunto[]> {
  const rutaLineal = interpolarRutaLineal50(oLat, oLng, dLat, dLng)
  const rutaReal = await obtenerRutaReal(oLat, oLng, dLat, dLng)
  let rutaFinal: RutaPunto[] = rutaReal ?? rutaLineal
  if (rutaFinal.length < 5) {
    rutaFinal = rutaLineal
  }
  if (rutaFinal.length > 200) {
    rutaFinal = reducirRuta(rutaFinal)
  }
  return rutaFinal
}

interface FormData {
  origen: string
  fecha: string
  hora: string
  horaLlegada: string
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
    horaLlegada: "",
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
  const [origenLat, setOrigenLat] = useState<number | null>(null)
  const [origenLng, setOrigenLng] = useState<number | null>(null)
  const [destinoLat] = useState<number>(CUCEI_LAT)
  const [destinoLng] = useState<number>(CUCEI_LNG)
  const [ruta, setRuta] = useState<RutaPunto[]>([])
  const [geocoding, setGeocoding] = useState(false)
  const geocodingBusyRef = useRef(false)
  const [modoPublicacion, setModoPublicacion] = useState<"unitario" | "rutina">("rutina")
  const [rutinaDias, setRutinaDias] = useState<number[]>([1, 2, 3, 4, 5]) // Lun-Vie
  const [rutinaSemanas, setRutinaSemanas] = useState(12)
  const isEssentialComplete = (
    formData.origen.trim() !== "" &&
    formData.hora !== "" &&
    !!formData.precio && Number.parseFloat(formData.precio) > 0 &&
    !!formData.asientos && Number.parseInt(formData.asientos) >= 1 && Number.parseInt(formData.asientos) <= 4
  )

  const esRutinaSemanal = modoPublicacion === "rutina"
  const isRutinaValida = esRutinaSemanal ? rutinaDias.length > 0 && rutinaSemanas >= 1 : formData.fecha !== ""

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + (m || 0)
  }

  const calcDuracionMin = (salida: string, llegada: string) => {
    if (!salida || !llegada) return undefined
    const s = toMinutes(salida)
    const l = toMinutes(llegada)
    const diff = l - s
    if (diff >= 0) return diff
    // cruza medianoche
    return diff + 24 * 60
  }

  const nextDateForSelectedDays = (days: number[]) => {
    const today = new Date()
    const base = new Date(today)
    base.setHours(0, 0, 0, 0)
    const dow = base.getDay()
    const diffs = days
      .slice()
      .sort((a, b) => a - b)
      .map((d) => (d - dow + 7) % 7)
    const minDiff = diffs.length ? Math.min(...diffs) : 0
    const next = new Date(base)
    next.setDate(base.getDate() + minDiff)
    const yyyy = next.getFullYear()
    const mm = String(next.getMonth() + 1).padStart(2, "0")
    const dd = String(next.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

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

  const geocodificarDireccion = async (
    direccion: string,
    options?: { omitBusyGuard?: boolean }
  ): Promise<{ lat: number; lng: number } | null> => {
    const q = direccion.trim()
    if (!q) {
      setOrigenLat(null)
      setOrigenLng(null)
      return null
    }
    if (!options?.omitBusyGuard && geocodingBusyRef.current) return null
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return null

    geocodingBusyRef.current = true
    setGeocoding(true)
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&country=MX&limit=1&proximity=-103.3494,20.6597`
      const response = await fetch(url)
      const data = await response.json()
      if (data.features?.length > 0) {
        const center = data.features[0].center as [number, number]
        const lng = center[0]
        const lat = center[1]
        setOrigenLat(lat)
        setOrigenLng(lng)
        return { lat, lng }
      }
    } catch {
      // sin toast: UX intacta
    } finally {
      geocodingBusyRef.current = false
      setGeocoding(false)
    }
    return null
  }

  useEffect(() => {
    if (origenLat === null || origenLng === null) {
      setRuta([])
      return
    }
    const lineal = interpolarRutaLineal50(origenLat, origenLng, destinoLat, destinoLng)
    setRuta(lineal)
    let cancelled = false
    void computeRutaFinalParaViaje(origenLat, origenLng, destinoLat, destinoLng).then((r) => {
      if (!cancelled) setRuta(r)
    })
    return () => {
      cancelled = true
    }
  }, [origenLat, origenLng, destinoLat, destinoLng])

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
        setOrigenLat(latitude)
        setOrigenLng(longitude)
        const direccion = await obtenerDireccionDesdeCoordenadas(latitude, longitude)
        setFormData((prev) => ({ ...prev, origen: direccion }))
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
    if (!esRutinaSemanal) {
      if (!formData.fecha) newErrors.fecha = "Requerida"
      else {
        const selectedDate = new Date(formData.fecha)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) newErrors.fecha = "Fecha inválida"
      }
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

    let latSubmit = origenLat
    let lngSubmit = origenLng
    if (latSubmit === null || lngSubmit === null) {
      const resolved = await geocodificarDireccion(formData.origen, { omitBusyGuard: true })
      if (resolved) {
        latSubmit = resolved.lat
        lngSubmit = resolved.lng
      }
    }
    if (latSubmit === null || lngSubmit === null) {
      toast.error(
        "No se pudo ubicar el origen. Escribe una dirección clara (ej. colonia y ciudad) o usa «Usar mi ubicación»."
      )
      return
    }

    setIsSubmitting(true)

    try {
      const rutaFinal = await computeRutaFinalParaViaje(latSubmit, lngSubmit, destinoLat, destinoLng)

      const fechaEnvio = esRutinaSemanal ? nextDateForSelectedDays(rutinaDias) : formData.fecha
      const duracionEstimadaMin = calcDuracionMin(formData.hora, formData.horaLlegada)

      await tripsApi.create({
        vehiculoId: selectedVehicleId,
        origen: formData.origen,
        destino: CUCEI_ADDRESS,
        origenLat: latSubmit,
        origenLng: lngSubmit,
        destinoLat,
        destinoLng,
        ruta: rutaFinal,
        fecha: fechaEnvio,
        hora: formData.hora,
        ...(esRutinaSemanal ? { recurrenciaSemanalDias: rutinaDias, recurrenciaSemanalSemanas: rutinaSemanas } : {}),
        asientosTotales: Number.parseInt(formData.asientos),
        precio: Number.parseFloat(formData.precio),
        notas: formData.notas || undefined,
        ...(duracionEstimadaMin !== undefined ? { duracionEstimadaMin } : {}),
      })

      setRuta(rutaFinal)
      setShowSuccess(true)
      toast.success("¡Viaje publicado exitosamente!")

      setFormData({
        origen: "",
        fecha: "",
        hora: "",
        horaLlegada: "",
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
      setOrigenLat(null)
      setOrigenLng(null)
      setRuta([])

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
            {/* Modo de publicación */}
            <div className="space-y-2">
              <Label className="text-sm">¿Qué quieres publicar?</Label>
              <Tabs value={modoPublicacion} onValueChange={(v) => setModoPublicacion(v as any)} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="rutina">Rutina semanal</TabsTrigger>
                  <TabsTrigger value="unitario">Viaje unitario</TabsTrigger>
                </TabsList>
                <TabsContent value="rutina" className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Ideal si siempre sales los mismos días a la misma hora. Lo publicas una vez y generamos tus viajes por varias semanas.
                  </p>
                </TabsContent>
                <TabsContent value="unitario" className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Publica un solo viaje para una fecha específica.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

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
                  {geocoding ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  <Input
                    id="origen"
                    placeholder="Ej: Av. Patria 1500, Zapopan"
                    value={formData.origen}
                    onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                    onBlur={(e) => {
                      void geocodificarDireccion(e.target.value)
                    }}
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
                {esRutinaSemanal ? (
                  <div className="space-y-2">
                    <Label className="text-sm">Días de la semana <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { d: 1, label: "Lunes" },
                        { d: 2, label: "Martes" },
                        { d: 3, label: "Miércoles" },
                        { d: 4, label: "Jueves" },
                        { d: 5, label: "Viernes" },
                        { d: 6, label: "Sábado" },
                        { d: 0, label: "Domingo" },
                      ].map(({ d, label }) => (
                        <label key={d} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={rutinaDias.includes(d)}
                            onCheckedChange={(c) => {
                              const checked = !!c
                              setRutinaDias((prev) => {
                                const set = new Set(prev)
                                if (checked) set.add(d)
                                else set.delete(d)
                                return Array.from(set).sort((a, b) => a - b)
                              })
                            }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">¿Cuántas semanas?</Label>
                      <Select value={String(rutinaSemanas)} onValueChange={(v) => setRutinaSemanas(Number(v))}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[4, 8, 12, 16, 24].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} semanas
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Próxima fecha: {nextDateForSelectedDays(rutinaDias)}
                    </p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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

            {/* Hora de llegada (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="horaLlegada" className="text-sm">Hora de llegada a CUCEI (opcional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="horaLlegada"
                  type="time"
                  value={formData.horaLlegada}
                  onChange={(e) => setFormData({ ...formData, horaLlegada: e.target.value })}
                  className="pl-9 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Se usará para calcular una duración estimada (no afecta la búsqueda).
              </p>
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
              routePoints={ruta.length >= 2 ? ruta : undefined}
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
            disabled={isSubmitting || !isEssentialComplete || !isRutinaValida}
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
          <p className="text-xs text-muted-foreground">
            Completa origen, {esRutinaSemanal ? "días/semana(s) de la rutina" : "fecha"}, hora, asientos y precio para publicar.
          </p>
        )}
      </form>
      )}
    </div>
  )
}
