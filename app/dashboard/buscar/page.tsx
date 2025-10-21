// app/dashboard/buscar/page.tsx

"use client"

import { ChatModal } from "@/components/dashboard/chat-modal"
import { EmptyState } from "@/components/dashboard/empty-state"
import { MapRoute } from "@/components/dashboard/map-route"
import { PageHeader } from "@/components/dashboard/page-header"
import { ViajeDetailsModal } from "@/components/dashboard/viaje-details-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, DollarSign, Loader2, MapPin, MapPinned, Navigation, Route, Star, Users } from "lucide-react"
import { useEffect, useState } from "react"

const CUCEI_ADDRESS = "Blvd. Gral. Marcelino García Barragán 1421, Olímpica, 44430 Guadalajara, Jal."

interface Viaje {
  id: string
  conductor: {
    nombre: string
    foto: string
    rating: number
    totalViajes: number
    ubicacion: string
    carrera?: string
    vehiculo?: {
      marca: string
      modelo: string
      color: string
    }
  }
  origen: string
  destino: string
  fecha: string
  hora: string
  asientosDisponibles: number
  precioSugerido: number
  preferencias: string[]
  distanciaKm?: number
  notas?: string
}

// Viajes de ejemplo - todos van a CUCEI
const viajesEjemplo: Viaje[] = [
  {
    id: "1",
    conductor: {
      nombre: "María González",
      foto: "/placeholder.svg?height=48&width=48",
      rating: 4.9,
      totalViajes: 45,
      ubicacion: "Chapalita, Guadalajara",
      carrera: "Ingeniería Industrial",
      vehiculo: {
        marca: "Honda",
        modelo: "Civic",
        color: "Blanco",
      },
    },
    origen: "Av. Guadalupe 1500, Chapalita, Guadalajara",
    destino: CUCEI_ADDRESS,
    fecha: "2025-01-15",
    hora: "07:00",
    asientosDisponibles: 3,
    precioSugerido: 30,
    preferencias: ["No fumar", "Música"],
    distanciaKm: 2.5,
    notas: "Paso por Av. Patria",
  },
  {
    id: "2",
    conductor: {
      nombre: "Carlos Ramírez",
      foto: "/placeholder.svg?height=48&width=48",
      rating: 4.7,
      totalViajes: 32,
      ubicacion: "Zapopan Centro",
      carrera: "Administración",
      vehiculo: {
        marca: "Nissan",
        modelo: "Versa",
        color: "Gris",
      },
    },
    origen: "Plaza Patria, Zapopan, Jalisco",
    destino: CUCEI_ADDRESS,
    fecha: "2025-01-15",
    hora: "07:15",
    asientosDisponibles: 2,
    precioSugerido: 35,
    preferencias: ["No fumar"],
    distanciaKm: 4.2,
  },
  {
    id: "3",
    conductor: {
      nombre: "Ana Martínez",
      foto: "/placeholder.svg?height=48&width=48",
      rating: 5.0,
      totalViajes: 67,
      ubicacion: "Providencia",
      carrera: "Medicina",
      vehiculo: {
        marca: "Toyota",
        modelo: "Corolla",
        color: "Negro",
      },
    },
    origen: "Av. Providencia 2500, Guadalajara",
    destino: CUCEI_ADDRESS,
    fecha: "2025-01-15",
    hora: "06:45",
    asientosDisponibles: 1,
    precioSugerido: 40,
    preferencias: ["No fumar", "Puntualidad"],
    distanciaKm: 5.8,
  },
]

export default function BuscarViajePage() {
  const [miUbicacion, setMiUbicacion] = useState("")
  const [ubicacionActual, setUbicacionActual] = useState<{ lat: number; lng: number } | null>(null)
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatContact, setChatContact] = useState<{ nombre: string; foto: string } | null>(null)
  const [geolocalizando, setGeolocalizando] = useState(false)
  const [errorUbicacion, setErrorUbicacion] = useState("")
  const [fecha, setFecha] = useState("")
  const [rutaViendose, setRutaViendose] = useState<string | null>(null)
  const [origenRuta, setOrigenRuta] = useState("")
  const [destinoRuta, setDestinoRuta] = useState("")

  // Obtener ubicación actual
  const obtenerUbicacionActual = () => {
    setGeolocalizando(true)
    setErrorUbicacion("")

    if (!navigator.geolocation) {
      setErrorUbicacion("Tu navegador no soporta geolocalización")
      setGeolocalizando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUbicacionActual({ lat: latitude, lng: longitude })
        setMiUbicacion("Mi ubicación actual")
        setGeolocalizando(false)
        buscarViajes()
      },
      (error) => {
        setErrorUbicacion("No se pudo obtener tu ubicación. Por favor, ingrésala manualmente.")
        setGeolocalizando(false)
      }
    )
  }

  const buscarViajes = () => {
    // Simular búsqueda y ordenar por distancia
    const viajesFiltrados = [...viajesEjemplo].sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0))
    setViajes(viajesFiltrados)
  }

  const verRutaDeViaje = (viaje: Viaje) => {
    setRutaViendose(viaje.id)
    setOrigenRuta(viaje.origen)
    setDestinoRuta(viaje.destino)
    
    // Scroll suave al mapa
    const mapaElement = document.getElementById('mapa-rutas')
    if (mapaElement) {
      mapaElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const volverAMiRuta = () => {
    setRutaViendose(null)
    setOrigenRuta(miUbicacion)
    setDestinoRuta(CUCEI_ADDRESS)
  }

  useEffect(() => {
    if (miUbicacion) {
      buscarViajes()
      setOrigenRuta(miUbicacion)
      setDestinoRuta(CUCEI_ADDRESS)
    }
  }, [miUbicacion])

  const handleVerDetalles = (viaje: Viaje) => {
    setSelectedViaje(viaje)
    setShowDetailsModal(true)
  }

  const handleOpenChat = (conductor: { nombre: string; foto: string }) => {
    setChatContact(conductor)
    setShowChatModal(true)
    setShowDetailsModal(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Buscar viaje a CUCEI" />

      {/* Alerta informativa */}
      <Alert className="border-primary/20 bg-primary/5">
        <MapPinned className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">Destino fijo:</span> CUCEI - Todos los viajes van a la universidad
        </AlertDescription>
      </Alert>

      {/* Card de ubicación */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">¿Dónde te encuentras?</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Buscaremos rutas que pasen cerca de tu ubicación
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={obtenerUbicacionActual}
              disabled={geolocalizando}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {geolocalizando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Obteniendo...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Usar ubicación actual
                </>
              )}
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">o</span>
              <div className="flex-1 space-y-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ingresa tu dirección o colonia"
                    value={miUbicacion}
                    onChange={(e) => setMiUbicacion(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-sm">¿Cuándo necesitas ir?</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="text-sm"
            />
          </div>

          {errorUbicacion && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs sm:text-sm">{errorUbicacion}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Mapa interactivo */}
      {miUbicacion && (
        <Card className="p-0 overflow-hidden" id="mapa-rutas">
          <MapRoute 
            origin={origenRuta || miUbicacion}
            destination={destinoRuta || CUCEI_ADDRESS}
            height="350px"
            className="sm:h-[450px]"
          />
          <div className="p-3 sm:p-4 bg-muted/30 border-t">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 text-xs sm:text-sm flex-1">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  {rutaViendose ? (
                    <>
                      <p className="font-medium text-foreground">
                        Viendo ruta de {viajes.find(v => v.id === rutaViendose)?.conductor.nombre}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {viajes.find(v => v.id === rutaViendose)?.origen}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">Tu ruta a CUCEI</p>
                      <p className="text-muted-foreground text-xs">{CUCEI_ADDRESS}</p>
                    </>
                  )}
                </div>
              </div>
              {rutaViendose && (
                <Button
                  onClick={volverAMiRuta}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mi ruta</span>
                  <span className="sm:hidden">Volver</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Resultados */}
      {miUbicacion && (
        <>
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-sm sm:text-base font-semibold text-foreground">
                {viajes.length} {viajes.length === 1 ? "ruta disponible" : "rutas disponibles"}
              </p>
              <p className="text-xs text-muted-foreground">Ordenadas por cercanía a tu ubicación</p>
            </div>
          </div>

          {viajes.length === 0 ? (
            <Card>
              <EmptyState
                icon={MapPin}
                title="No hay rutas cerca"
                description="Intenta con otra ubicación o fecha."
              />
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {viajes.map((viaje) => (
                <Card 
                  key={viaje.id} 
                  className={`p-4 sm:p-5 transition-all ${
                    rutaViendose === viaje.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Header con distancia */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                          <AvatarImage src={viaje.conductor.foto || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {viaje.conductor.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-card-foreground truncate">
                            {viaje.conductor.nombre}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {viaje.conductor.ubicacion}
                          </p>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-0.5">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-accent text-accent" />
                            <span className="font-medium text-foreground">{viaje.conductor.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm">
                          {viaje.distanciaKm} km
                        </Badge>
                        <span className="text-xs text-muted-foreground">de ti</span>
                      </div>
                    </div>

                    {/* Ruta simplificada */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 rounded-lg p-2 sm:p-3">
                      <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="flex-1 truncate">{viaje.origen.split(',')[0]}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-foreground flex-shrink-0">CUCEI</span>
                    </div>

                    {/* Detalles en línea */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="font-medium">{viaje.hora}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{viaje.asientosDisponibles} libres</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-accent font-semibold">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>${viaje.precioSugerido}</span>
                      </div>
                    </div>

                    {/* Preferencias y notas */}
                    {(viaje.preferencias.length > 0 || viaje.notas) && (
                      <div className="space-y-2">
                        {viaje.preferencias.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {viaje.preferencias.slice(0, 3).map((pref, index) => (
                              <Badge key={index} variant="outline" className="text-xs py-0 h-5">
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {viaje.notas && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Ruta:</span> {viaje.notas}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => verRutaDeViaje(viaje)}
                        variant={rutaViendose === viaje.id ? "default" : "outline"}
                        className={`flex-1 text-sm sm:text-base ${
                          rutaViendose === viaje.id 
                            ? 'bg-primary text-primary-foreground' 
                            : ''
                        }`}
                        size="sm"
                      >
                        <Route className="w-4 h-4 mr-2" />
                        {rutaViendose === viaje.id ? 'Viendo ruta' : 'Ver ruta'}
                      </Button>
                      <Button
                        onClick={() => handleVerDetalles(viaje)}
                        className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-sm sm:text-base"
                        size="sm"
                      >
                        Solicitar viaje
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Estado inicial */}
      {!miUbicacion && (
        <Card>
          <EmptyState
            icon={Navigation}
            title="Comparte tu ubicación"
            description="Ingresa tu dirección o usa tu ubicación actual para encontrar rutas cerca de ti."
          />
        </Card>
      )}

      {/* Modals */}
      {selectedViaje && (
        <ViajeDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          viaje={selectedViaje}
          onSolicitar={() => {
            console.log("Solicitud enviada")
          }}
          onChat={() => handleOpenChat(selectedViaje.conductor)}
        />
      )}

      {chatContact && <ChatModal open={showChatModal} onOpenChange={setShowChatModal} contacto={chatContact} />}
    </div>
  )
}
