// app/dashboard/calificaciones/page.tsx

"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Star } from "lucide-react"
import { useMemo, useState } from "react"

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

const MAX_COMENTARIO = 240

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
  const [resenas, setResenas] = useState<Resena[]>(todasLasResenas)

  // Estados para el modal de calificación
  const [showCalificarModal, setShowCalificarModal] = useState(false)
  const [viajeSeleccionado, setViajeSeleccionado] = useState<any>(null)
  const [ratingSeleccionado, setRatingSeleccionado] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [viajesPendientesState, setViajesPendientesState] = useState(viajesPendientes)
  const [viajesCalificados, setViajesCalificados] = useState<any[]>([])
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "conductor" | "pasajero">("todos")
  const [filtroOrden, setFiltroOrden] = useState<"recientes" | "rating">("recientes")
  const [busqueda, setBusqueda] = useState("")
  const [filtroSoloCinco, setFiltroSoloCinco] = useState(false)

  const ratingPromedio = useMemo(() => {
    if (resenas.length === 0) return 0
    return resenas.reduce((acc, r) => acc + r.rating, 0) / resenas.length
  }, [resenas])

  const distribucion = useMemo(() => {
    return [5, 4, 3, 2, 1].map((estrella) => ({
      estrella,
      cantidad: resenas.filter((r) => r.rating === estrella).length,
    }))
  }, [resenas])

  const resenasFiltradas = useMemo(() => {
    let lista = [...resenas]

    if (filtroTipo !== "todos") {
      lista = lista.filter((r) => r.tipoViaje === filtroTipo)
    }

    if (filtroSoloCinco) {
      lista = lista.filter((r) => r.rating === 5)
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase()
      lista = lista.filter(
        (r) =>
          r.autor.toLowerCase().includes(term) ||
          r.comentario.toLowerCase().includes(term) ||
          r.ruta.toLowerCase().includes(term)
      )
    }

    if (filtroOrden === "recientes") {
      lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    } else {
      lista.sort((a, b) => b.rating - a.rating || new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    }

    return lista
  }, [resenas, filtroTipo, filtroOrden, busqueda, filtroSoloCinco])

  const abrirModalCalificar = (viaje: any) => {
    setViajeSeleccionado(viaje)
    setRatingSeleccionado(0)
    setHoverRating(0)
    setComentario("")
    setShowCalificarModal(true)
  }

  const handleCalificar = () => {
    if (!viajeSeleccionado || ratingSeleccionado === 0) return

    const comentarioFinal = (comentario || "Sin comentarios adicionales").trim()

    // Crear la calificación
    const nuevaCalificacion = {
      id: `cal-${Date.now()}`,
      conductor: viajeSeleccionado.conductor,
      conductorFoto: viajeSeleccionado.conductorFoto,
      rating: ratingSeleccionado,
      comentario: comentarioFinal,
      fecha: viajeSeleccionado.fecha,
      ruta: viajeSeleccionado.ruta,
    }

    // Agregar a viajes calificados
    setViajesCalificados([nuevaCalificacion, ...viajesCalificados])

    // Guardar en reseñas recibidas
    const resenaNueva: Resena = {
      id: `res-${Date.now()}`,
      autor: "Tú",
      autorFoto: "/placeholder.svg?height=40&width=40",
      rating: ratingSeleccionado,
      comentario: comentarioFinal,
      fecha: viajeSeleccionado.fecha,
      tipoViaje: "pasajero",
      ruta: viajeSeleccionado.ruta,
    }
    setResenas([resenaNueva, ...resenas])

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
      <Card className="p-6 mb-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Star className="w-8 h-8 fill-accent text-accent" />
              <span className="text-5xl font-bold text-foreground">{ratingPromedio.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground">Calificación promedio</p>
            <p className="text-xs text-muted-foreground mt-1">{resenas.length} reseñas totales</p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{resenas.length}</div>
              <div className="text-sm text-muted-foreground">Total de reseñas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {resenas.filter((r) => r.rating === 5).length}
              </div>
              <div className="text-sm text-muted-foreground">Reseñas 5★</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg hidden md:block">
              <div className="text-2xl font-bold text-foreground">
                {resenas.filter((r) => r.tipoViaje === "conductor").length}
              </div>
              <div className="text-sm text-muted-foreground">Como conductor</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {distribucion.map(({ estrella, cantidad }) => {
            const porcentaje = resenas.length === 0 ? 0 : Math.round((cantidad / resenas.length) * 100)
            return (
              <div key={estrella} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>{estrella}</span>
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{porcentaje}%</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Filtros y búsqueda */}
      <Card className="p-4 sm:p-5 mb-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nombre, ruta o comentario"
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="conductor">Como conductor</SelectItem>
                <SelectItem value="pasajero">Como pasajero</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroOrden} onValueChange={(v) => setFiltroOrden(v as any)}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recientes">Más recientes</SelectItem>
                <SelectItem value="rating">Mejor rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={filtroSoloCinco ? "default" : "outline"}
            onClick={() => setFiltroSoloCinco(!filtroSoloCinco)}
          >
            Solo 5★
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setFiltroTipo("todos")
              setFiltroOrden("recientes")
              setFiltroSoloCinco(false)
              setBusqueda("")
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {resenasFiltradas.map((resena) => (
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
        {resenasFiltradas.length === 0 && (
          <Card className="p-6 text-center space-y-2">
            <p className="font-semibold text-card-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">Ajusta filtros o búsqueda para ver reseñas.</p>
          </Card>
        )}
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
                onChange={(e) => setComentario(e.target.value.slice(0, MAX_COMENTARIO))}
                rows={4}
                className="resize-none"
                maxLength={MAX_COMENTARIO}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comentario.length}/{MAX_COMENTARIO}
              </p>
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
