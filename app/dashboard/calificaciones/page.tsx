// app/dashboard/calificaciones/page.tsx

"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useState } from "react"

interface Resena {
  id: string
  autor: string
  autorFoto: string
  rating: number
  comentario: string
  fecha: string
  tipoViaje: "conductor" | "pasajero"
  ruta: string
}

const todasLasResenas: Resena[] = [
  {
    id: "1",
    autor: "María González",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comentario: "Excelente conductor, muy puntual y amable. El viaje fue muy cómodo y seguro.",
    fecha: "2025-01-10",
    tipoViaje: "conductor",
    ruta: "Campus Central → Centro Comercial",
  },
  {
    id: "2",
    autor: "Carlos Ramírez",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comentario: "Muy buen pasajero, respetuoso y puntual. Recomendado 100%.",
    fecha: "2025-01-08",
    tipoViaje: "pasajero",
    ruta: "Biblioteca → Zona Norte",
  },
  {
    id: "3",
    autor: "Ana Martínez",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 4,
    comentario: "Buen conductor, solo hubo un pequeño retraso pero avisó con tiempo.",
    fecha: "2025-01-05",
    tipoViaje: "conductor",
    ruta: "Facultad → Aeropuerto",
  },
  {
    id: "4",
    autor: "Luis Hernández",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comentario: "Excelente experiencia, muy conversador y amable durante todo el viaje.",
    fecha: "2025-01-03",
    tipoViaje: "pasajero",
    ruta: "Campus → Centro Histórico",
  },
]

// Viajes pendientes de calificar
const viajesPendientes = [
  {
    id: "p1",
    conductor: "Juan Pérez",
    conductorFoto: "/placeholder.svg?height=40&width=40",
    fecha: "2025-01-12",
    ruta: "Plaza del Sol → CUCEI",
  },
  {
    id: "p2",
    conductor: "Sofia López",
    conductorFoto: "/placeholder.svg?height=40&width=40",
    fecha: "2025-01-11",
    ruta: "Chapalita → CUCEI",
  },
]

export default function CalificacionesPage() {
  const ratingPromedio = todasLasResenas.reduce((acc, r) => acc + r.rating, 0) / todasLasResenas.length
  
  // Estados para el modal de calificación
  const [showCalificarModal, setShowCalificarModal] = useState(false)
  const [viajeSeleccionado, setViajeSeleccionado] = useState<any>(null)
  const [ratingSeleccionado, setRatingSeleccionado] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [viajesPendientesState, setViajesPendientesState] = useState(viajesPendientes)
  const [viajesCalificados, setViajesCalificados] = useState<any[]>([])

  const abrirModalCalificar = (viaje: any) => {
    setViajeSeleccionado(viaje)
    setRatingSeleccionado(0)
    setHoverRating(0)
    setComentario("")
    setShowCalificarModal(true)
  }

  const handleCalificar = () => {
    // Crear la calificación
    const nuevaCalificacion = {
      id: `cal-${Date.now()}`,
      conductor: viajeSeleccionado.conductor,
      conductorFoto: viajeSeleccionado.conductorFoto,
      rating: ratingSeleccionado,
      comentario: comentario || "Sin comentarios adicionales",
      fecha: viajeSeleccionado.fecha,
      ruta: viajeSeleccionado.ruta,
    }

    // Agregar a viajes calificados
    setViajesCalificados([nuevaCalificacion, ...viajesCalificados])

    // Remover de pendientes
    setViajesPendientesState(
      viajesPendientesState.filter((v) => v.id !== viajeSeleccionado.id)
    )

    setShowCalificarModal(false)
  }

  return (
    <div>
      <PageHeader title="Calificaciones" description="Califica tus viajes recientes y revisa tus reseñas" />

      {/* Viajes pendientes de calificar */}
      {viajesPendientesState.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Viajes pendientes de calificar</h3>
          <div className="space-y-3">
            {viajesPendientesState.map((viaje) => (
              <div
                key={viaje.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={viaje.conductorFoto || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {viaje.conductor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{viaje.conductor}</p>
                    <p className="text-xs text-muted-foreground">{viaje.ruta}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(viaje.fecha).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <Button onClick={() => abrirModalCalificar(viaje)} size="sm">
                  Calificar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Viajes calificados recientemente */}
      {viajesCalificados.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 text-green-600 dark:text-green-400">
            Viajes calificados recientemente
          </h3>
          <div className="space-y-4">
            {viajesCalificados.map((viaje) => (
              <div
                key={viaje.id}
                className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={viaje.conductorFoto || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {viaje.conductor
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-card-foreground">{viaje.conductor}</p>
                      <p className="text-sm text-muted-foreground">{viaje.ruta}</p>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      Calificado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < viaje.rating ? "fill-accent text-accent" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{viaje.comentario}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumen */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Star className="w-8 h-8 fill-accent text-accent" />
              <span className="text-5xl font-bold text-foreground">{ratingPromedio.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground">Calificación promedio</p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{todasLasResenas.length}</div>
              <div className="text-sm text-muted-foreground">Total de reseñas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {todasLasResenas.filter((r) => r.rating === 5).length}
              </div>
              <div className="text-sm text-muted-foreground">Reseñas 5★</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {todasLasResenas.map((resena) => (
          <Card key={resena.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={resena.autorFoto || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {resena.autor
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-card-foreground">{resena.autor}</p>
                    <p className="text-sm text-muted-foreground">{resena.ruta}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {resena.tipoViaje === "conductor" ? "Como conductor" : "Como pasajero"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(resena.fecha).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < resena.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{resena.comentario}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Calificación */}
      <Dialog open={showCalificarModal} onOpenChange={setShowCalificarModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Calificar Ride</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con {viajeSeleccionado?.conductor}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información del viaje */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={viajeSeleccionado?.conductorFoto || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {viajeSeleccionado?.conductor
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{viajeSeleccionado?.conductor}</p>
                <p className="text-sm text-muted-foreground">{viajeSeleccionado?.ruta}</p>
              </div>
            </div>

            {/* Selector de estrellas */}
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">¿Cómo fue tu experiencia?</p>
              <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1
                  const isActive = starValue <= (hoverRating || ratingSeleccionado)
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRatingSeleccionado(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          isActive
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              {ratingSeleccionado > 0 && (
                <p className="text-sm text-muted-foreground">
                  {ratingSeleccionado === 5 && "¡Excelente!"}
                  {ratingSeleccionado === 4 && "Muy bueno"}
                  {ratingSeleccionado === 3 && "Bueno"}
                  {ratingSeleccionado === 2 && "Regular"}
                  {ratingSeleccionado === 1 && "Necesita mejorar"}
                </p>
              )}
            </div>

            {/* Comentario */}
            <div className="space-y-2">
              <label htmlFor="comentario" className="text-sm font-medium">
                Comentario (opcional)
              </label>
              <Textarea
                id="comentario"
                placeholder="Comparte más detalles sobre tu experiencia..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCalificarModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCalificar}
              disabled={ratingSeleccionado === 0}
            >
              Enviar calificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
