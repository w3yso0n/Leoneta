// app/dashboard/mis-viajes/page.tsx

"use client"

import { EmptyState } from "@/components/dashboard/empty-state"
import { PageHeader } from "@/components/dashboard/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle, CheckCircle2, Clock, Copy, DollarSign, Filter, MapPin, MessageSquare, RotateCcw, Search, Users, X } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

interface Viaje {
  id: string
  origen: string
  destino: string
  fecha: string
  hora: string
  asientosDisponibles: number
  asientosTotales: number
  precioSugerido: number
  estado: "proximo" | "completado" | "cancelado"
  pasajeros?: {
    nombre: string
    foto: string
    rating: number
  }[]
  conductor?: {
    nombre: string
    foto: string
    rating: number
  }
}

const viajesConductor: Viaje[] = [
  {
    id: "1",
    origen: "Campus Central",
    destino: "Centro Comercial Plaza",
    fecha: "2025-01-20",
    hora: "14:30",
    asientosDisponibles: 1,
    asientosTotales: 3,
    precioSugerido: 50,
    estado: "proximo",
    pasajeros: [
      {
        nombre: "Ana López",
        foto: "/placeholder.svg?height=40&width=40",
        rating: 4.8,
      },
      {
        nombre: "Pedro García",
        foto: "/placeholder.svg?height=40&width=40",
        rating: 4.9,
      },
    ],
  },
  {
    id: "2",
    origen: "Biblioteca Central",
    destino: "Zona Residencial Norte",
    fecha: "2025-01-10",
    hora: "18:00",
    asientosDisponibles: 0,
    asientosTotales: 2,
    precioSugerido: 40,
    estado: "completado",
    pasajeros: [
      {
        nombre: "María Rodríguez",
        foto: "/placeholder.svg?height=40&width=40",
        rating: 5.0,
      },
      {
        nombre: "Luis Martínez",
        foto: "/placeholder.svg?height=40&width=40",
        rating: 4.7,
      },
    ],
  },
]

const viajesPasajero: Viaje[] = [
  {
    id: "3",
    origen: "Facultad de Ingeniería",
    destino: "Aeropuerto Internacional",
    fecha: "2025-01-25",
    hora: "06:00",
    asientosDisponibles: 0,
    asientosTotales: 1,
    precioSugerido: 150,
    estado: "proximo",
    conductor: {
      nombre: "Carlos Ramírez",
      foto: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
    },
  },
  {
    id: "4",
    origen: "Campus Central",
    destino: "Centro Histórico",
    fecha: "2025-01-05",
    hora: "10:00",
    asientosDisponibles: 0,
    asientosTotales: 1,
    precioSugerido: 35,
    estado: "completado",
    conductor: {
      nombre: "Laura Sánchez",
      foto: "/placeholder.svg?height=40&width=40",
      rating: 5.0,
    },
  },
]

export default function MisViajesPage() {
  const [activeTab, setActiveTab] = useState("conductor")
  const [tripsConductor, setTripsConductor] = useState<Viaje[]>(viajesConductor)
  const [tripsPasajero, setTripsPasajero] = useState<Viaje[]>(viajesPasajero)
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "proximo" | "completado" | "cancelado">("todos")
  const [filtroDesde, setFiltroDesde] = useState("")
  const [filtroHasta, setFiltroHasta] = useState("")
  const [filtroTexto, setFiltroTexto] = useState("")

  const aplicaFiltros = (lista: Viaje[]) => {
    return lista.filter((v) => {
      const fechaMs = new Date(v.fecha).getTime()
      if (filtroEstado !== "todos" && v.estado !== filtroEstado) return false
      if (filtroDesde && fechaMs < new Date(filtroDesde).getTime()) return false
      if (filtroHasta && fechaMs > new Date(filtroHasta).getTime()) return false

      if (filtroTexto.trim()) {
        const term = filtroTexto.toLowerCase()
        const pasajeroMatch = v.pasajeros?.some((p) => p.nombre.toLowerCase().includes(term))
        const conductorMatch = v.conductor?.nombre.toLowerCase().includes(term)
        const rutaMatch = `${v.origen} ${v.destino}`.toLowerCase().includes(term)
        if (!(pasajeroMatch || conductorMatch || rutaMatch)) return false
      }
      return true
    })
  }

  const filtradosConductor = useMemo(() => aplicaFiltros(tripsConductor), [tripsConductor, filtroEstado, filtroDesde, filtroHasta, filtroTexto])
  const filtradosPasajero = useMemo(() => aplicaFiltros(tripsPasajero), [tripsPasajero, filtroEstado, filtroDesde, filtroHasta, filtroTexto])

  const proximosConductor = useMemo(() => filtradosConductor.filter((v) => v.estado === "proximo"), [filtradosConductor])
  const completadosConductor = useMemo(() => filtradosConductor.filter((v) => v.estado === "completado"), [filtradosConductor])
  const canceladosConductor = useMemo(() => filtradosConductor.filter((v) => v.estado === "cancelado"), [filtradosConductor])
  const proximosPasajero = useMemo(() => filtradosPasajero.filter((v) => v.estado === "proximo"), [filtradosPasajero])
  const completadosPasajero = useMemo(() => filtradosPasajero.filter((v) => v.estado === "completado"), [filtradosPasajero])
  const canceladosPasajero = useMemo(() => filtradosPasajero.filter((v) => v.estado === "cancelado"), [filtradosPasajero])

  const resumen = useMemo(() => {
    const total = filtradosConductor.length + filtradosPasajero.length
    const completados = [...filtradosConductor, ...filtradosPasajero].filter((v) => v.estado === "completado").length
    const proximos = [...filtradosConductor, ...filtradosPasajero].filter((v) => v.estado === "proximo").length
    const cancelados = [...filtradosConductor, ...filtradosPasajero].filter((v) => v.estado === "cancelado").length
    return { total, completados, proximos, cancelados }
  }, [filtradosConductor, filtradosPasajero])

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  const handleCancelar = (id: string, rol: "conductor" | "pasajero") => {
    if (!window.confirm("¿Seguro que deseas cancelar este viaje?")) return
    if (rol === "conductor") {
      setTripsConductor((prev) => prev.map((v) => (v.id === id ? { ...v, estado: "cancelado" } : v)))
    } else {
      setTripsPasajero((prev) => prev.map((v) => (v.id === id ? { ...v, estado: "cancelado" } : v)))
    }
  }

  const handleCompletar = (id: string, rol: "conductor" | "pasajero") => {
    if (rol === "conductor") {
      setTripsConductor((prev) => prev.map((v) => (v.id === id ? { ...v, estado: "completado" } : v)))
    } else {
      setTripsPasajero((prev) => prev.map((v) => (v.id === id ? { ...v, estado: "completado" } : v)))
    }
  }

  const handleDuplicar = (viaje: Viaje, rol: "conductor" | "pasajero") => {
    const nuevo: Viaje = {
      ...viaje,
      id: `${viaje.id}-copy-${Date.now()}`,
      estado: "proximo",
      fecha: viaje.fecha,
    }
    if (rol === "conductor") {
      setTripsConductor((prev) => [nuevo, ...prev])
    } else {
      setTripsPasajero((prev) => [nuevo, ...prev])
    }
  }

  const filtrosActivos = filtroEstado !== "todos" || filtroDesde !== "" || filtroHasta !== "" || filtroTexto.trim() !== ""

  return (
    <div>
      <PageHeader
        title="Mis viajes"
        description="Gestiona tus viajes como conductor y pasajero"
        action={
          <Link href="/dashboard/publicar">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Publicar nuevo viaje</Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Próximos</p>
          <p className="text-2xl font-bold text-foreground">{resumen.proximos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Completados</p>
          <p className="text-2xl font-bold text-foreground">{resumen.completados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total</p>
            {resumen.cancelados > 0 && (
              <Badge variant="secondary" className="text-[10px]">{resumen.cancelados} cancelados</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{resumen.total}</p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </div>
          {filtrosActivos && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiltroEstado("todos")
                setFiltroDesde("")
                setFiltroHasta("")
                setFiltroTexto("")
              }}
              className="h-8 text-xs"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por ruta, conductor o pasajero"
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              placeholder="Desde"
            />
            <Input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              placeholder="Hasta"
            />
          </div>
          <div>
            <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="proximo">Próximos</SelectItem>
                <SelectItem value="completado">Completados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Los filtros se aplican a ambas vistas (conductor y pasajero).</p>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="conductor">Como conductor</TabsTrigger>
          <TabsTrigger value="pasajero">Como pasajero</TabsTrigger>
        </TabsList>

        {/* Tab: Como Conductor */}
        <TabsContent value="conductor" className="space-y-6">
          {/* Próximos viajes */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Próximos viajes</h2>
            {proximosConductor.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Calendar}
                  title="No tienes viajes próximos"
                  description="Publica un nuevo viaje para comenzar a compartir tu ruta con otros estudiantes."
                  actionLabel="Publicar viaje"
                  onAction={() => (window.location.href = "/dashboard/publicar")}
                />
              </Card>
            ) : (
              <div className="grid gap-4">
                {proximosConductor.map((viaje) => (
                  <Card key={viaje.id} className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Ruta */}
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground">{viaje.origen}</p>
                            <div className="h-4 border-l-2 border-dashed border-border ml-2 my-1" />
                            <p className="font-medium text-card-foreground">{viaje.destino}</p>
                          </div>
                        </div>

                        {/* Detalles */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatFecha(viaje.fecha)} - {viaje.hora}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {viaje.asientosTotales - viaje.asientosDisponibles}/{viaje.asientosTotales} ocupados
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-accent font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>${viaje.precioSugerido} MXN</span>
                          </div>
                        </div>

                        {/* Pasajeros */}
                        {viaje.pasajeros && viaje.pasajeros.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-card-foreground">Pasajeros confirmados</p>
                              <Badge variant="outline" className="text-xs">
                                {viaje.pasajeros.length}/{viaje.asientosTotales} ocupados
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {viaje.pasajeros.map((pasajero, index) => (
                                <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={pasajero.foto || "/placeholder.svg"} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                      {pasajero.nombre
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{pasajero.nombre}</p>
                                    <p className="text-xs text-muted-foreground">{pasajero.rating}★</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex lg:flex-col gap-2 lg:w-40 flex-shrink-0">
                        <Button variant="outline" className="flex-1 lg:w-full bg-transparent">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 lg:w-full text-destructive hover:text-destructive bg-transparent"
                          onClick={() => handleCancelar(viaje.id, "conductor")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1 lg:w-full"
                          onClick={() => handleCompletar(viaje.id, "conductor")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Marcar completado
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 lg:w-full"
                          onClick={() => handleDuplicar(viaje, "conductor")}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Viajes completados */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Viajes completados</h2>
            {completadosConductor.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No tienes viajes completados aún</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completadosConductor.map((viaje) => (
                  <Card key={viaje.id} className="p-6 opacity-75">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completado
                          </Badge>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground">{viaje.origen}</p>
                            <div className="h-4 border-l-2 border-dashed border-border ml-2 my-1" />
                            <p className="font-medium text-card-foreground">{viaje.destino}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatFecha(viaje.fecha)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{viaje.pasajeros?.length || 0} pasajeros</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Viajes cancelados */}
          {canceladosConductor.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Viajes cancelados</h2>
              <div className="grid gap-4">
                {canceladosConductor.map((viaje) => (
                  <Card key={viaje.id} className="p-6 border-destructive/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="destructive" className="text-xs">Cancelado</Badge>
                      <span className="text-sm text-muted-foreground">{formatFecha(viaje.fecha)} - {viaje.hora}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-card-foreground">{viaje.origen}</p>
                        <div className="h-4 border-l-2 border-dashed border-border ml-2 my-1" />
                        <p className="font-medium text-card-foreground">{viaje.destino}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: Como Pasajero */}
        <TabsContent value="pasajero" className="space-y-6">
          {/* Próximos viajes */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Próximos viajes</h2>
            {proximosPasajero.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Calendar}
                  title="No tienes viajes próximos"
                  description="Busca viajes disponibles y únete a rutas que coincidan con tu destino."
                  actionLabel="Buscar viajes"
                  onAction={() => (window.location.href = "/dashboard/buscar")}
                />
              </Card>
            ) : (
              <div className="grid gap-4">
                {proximosPasajero.map((viaje) => (
                  <Card key={viaje.id} className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Conductor */}
                        {viaje.conductor && (
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={viaje.conductor.foto || "/placeholder.svg"} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {viaje.conductor.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-card-foreground">{viaje.conductor.nombre}</p>
                              <p className="text-sm text-muted-foreground">{viaje.conductor.rating}★ conductor</p>
                            </div>
                          </div>
                        )}

                        {/* Ruta */}
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground">{viaje.origen}</p>
                            <div className="h-4 border-l-2 border-dashed border-border ml-2 my-1" />
                            <p className="font-medium text-card-foreground">{viaje.destino}</p>
                          </div>
                        </div>

                        {/* Detalles */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatFecha(viaje.fecha)} - {viaje.hora}
                              </span>
                            </div>
                          <div className="flex items-center gap-2 text-accent font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>${viaje.precioSugerido} MXN</span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex lg:flex-col gap-2 lg:w-40 flex-shrink-0">
                        <Button variant="outline" className="flex-1 lg:w-full bg-transparent">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 lg:w-full text-destructive hover:text-destructive bg-transparent"
                          onClick={() => handleCancelar(viaje.id, "pasajero")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1 lg:w-full"
                          onClick={() => handleCompletar(viaje.id, "pasajero")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Marcar completado
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 lg:w-full"
                          onClick={() => handleDuplicar(viaje, "pasajero")}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Viajes completados */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Viajes completados</h2>
            {completadosPasajero.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No tienes viajes completados aún</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completadosPasajero.map((viaje) => (
                  <Card key={viaje.id} className="p-6 opacity-75">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completado
                          </Badge>
                        </div>

                        {viaje.conductor && (
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={viaje.conductor.foto || "/placeholder.svg"} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {viaje.conductor.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-card-foreground">{viaje.conductor.nombre}</p>
                              <p className="text-xs text-muted-foreground">{viaje.conductor.rating}★</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground">{viaje.origen}</p>
                            <div className="h-4 border-l-2 border-dashed border-border ml-2 my-1" />
                            <p className="font-medium text-card-foreground">{viaje.destino}</p>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 inline mr-2" />
                          {formatFecha(viaje.fecha)}
                        </div>
                      </div>

                      <div className="flex items-center lg:w-40 flex-shrink-0">
                        <div className="flex flex-col gap-2 w-full">
                          <Button variant="outline" className="w-full bg-transparent">
                            Calificar viaje
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => handleDuplicar(viaje, "pasajero")}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Viajes cancelados */}
          {canceladosPasajero.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Viajes cancelados</h2>
              <div className="grid gap-4">
                {canceladosPasajero.map((viaje) => (
                  <Card key={viaje.id} className="p-6 border-destructive/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="destructive" className="text-xs">Cancelado</Badge>
                      <span className="text-sm text-muted-foreground">{formatFecha(viaje.fecha)} - {viaje.hora}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-card-foreground">{viaje.origen}</p>
                        <div className="h-4 border-l-2 border-dashed border-border ml-2 my-1" />
                        <p className="font-medium text-card-foreground">{viaje.destino}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
