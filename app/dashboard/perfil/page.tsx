"use client"

import { useState } from "react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Car, Mail, Phone, MapPin, Edit, Save, X, Navigation, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Resena {
  id: string
  autor: string
  autorFoto: string
  rating: number
  comentario: string
  fecha: string
  tipoViaje: "conductor" | "pasajero"
}

const resenasEjemplo: Resena[] = [
  {
    id: "1",
    autor: "María González",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comentario: "Excelente conductor, muy puntual y amable. El viaje fue muy cómodo y seguro.",
    fecha: "2025-01-10",
    tipoViaje: "conductor",
  },
  {
    id: "2",
    autor: "Carlos Ramírez",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comentario: "Muy buen pasajero, respetuoso y puntual. Recomendado 100%.",
    fecha: "2025-01-08",
    tipoViaje: "pasajero",
  },
  {
    id: "3",
    autor: "Ana Martínez",
    autorFoto: "/placeholder.svg?height=40&width=40",
    rating: 4,
    comentario: "Buen conductor, solo hubo un pequeño retraso pero avisó con tiempo.",
    fecha: "2025-01-05",
    tipoViaje: "conductor",
  },
]

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [geolocalizando, setGeolocalizando] = useState(false)
  const [perfil, setPerfil] = useState({
    nombre: "Juan Pérez",
    email: "juan.perez@alumnos.udg.mx",
    telefono: "+52 33 1234 5678",
    carrera: "Ingeniería en Sistemas",
    departamento: "CUCEI",
    ubicacion: "Av. Patria 1500, Zapopan, Jalisco",
    colonia: "Jardines Universidad",
    foto: "/placeholder.svg?height=120&width=120",
  })

  const [vehiculo, setVehiculo] = useState({
    marca: "Toyota",
    modelo: "Corolla",
    año: "2020",
    color: "Gris",
    placas: "ABC-123-D",
  })

  const [editedPerfil, setEditedPerfil] = useState(perfil)
  const [editedVehiculo, setEditedVehiculo] = useState(vehiculo)

  const handleSave = () => {
    setPerfil(editedPerfil)
    setVehiculo(editedVehiculo)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCancel = () => {
    setEditedPerfil(perfil)
    setEditedVehiculo(vehiculo)
    setIsEditing(false)
  }

  const obtenerUbicacionActual = () => {
    setGeolocalizando(true)

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización")
      setGeolocalizando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEditedPerfil({ ...editedPerfil, ubicacion: "Mi ubicación actual" })
        setGeolocalizando(false)
      },
      (error) => {
        alert("No se pudo obtener tu ubicación. Ingrésala manualmente.")
        setGeolocalizando(false)
      }
    )
  }

  const ratingPromedio = resenasEjemplo.reduce((acc, r) => acc + r.rating, 0) / resenasEjemplo.length
  const totalViajes = 45

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Mi perfil" />

      {showSuccess && (
        <Alert className="border-accent bg-accent/10">
          <AlertDescription className="text-accent-foreground text-sm">Perfil actualizado exitosamente</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Información personal */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-card-foreground">Información personal</h2>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-accent hover:bg-accent/90">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={perfil.foto || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {perfil.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    value={isEditing ? editedPerfil.nombre : perfil.nombre}
                    onChange={(e) => setEditedPerfil({ ...editedPerfil, nombre: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <Input
                      id="carrera"
                      value={isEditing ? editedPerfil.carrera : perfil.carrera}
                      onChange={(e) => setEditedPerfil({ ...editedPerfil, carrera: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      value={isEditing ? editedPerfil.departamento : perfil.departamento}
                      onChange={(e) => setEditedPerfil({ ...editedPerfil, departamento: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground text-sm sm:text-base">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">{perfil.email}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm">Teléfono</Label>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="telefono"
                    value={isEditing ? editedPerfil.telefono : perfil.telefono}
                    onChange={(e) => setEditedPerfil({ ...editedPerfil, telefono: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ubicacion" className="text-sm">
                  Tu dirección o colonia
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ayuda a encontrar rutas que pasen cerca de ti
                </p>
                {isEditing && (
                  <Button
                    type="button"
                    onClick={obtenerUbicacionActual}
                    disabled={geolocalizando}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto mb-2"
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
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-2" />
                  <Input
                    id="ubicacion"
                    placeholder="Ej: Av. Patria 1500, Zapopan"
                    value={isEditing ? editedPerfil.ubicacion : perfil.ubicacion}
                    onChange={(e) => setEditedPerfil({ ...editedPerfil, ubicacion: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Información del vehículo */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-card-foreground">Información del vehículo</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={isEditing ? editedVehiculo.marca : vehiculo.marca}
                  onChange={(e) => setEditedVehiculo({ ...editedVehiculo, marca: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={isEditing ? editedVehiculo.modelo : vehiculo.modelo}
                  onChange={(e) => setEditedVehiculo({ ...editedVehiculo, modelo: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  value={isEditing ? editedVehiculo.año : vehiculo.año}
                  onChange={(e) => setEditedVehiculo({ ...editedVehiculo, año: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={isEditing ? editedVehiculo.color : vehiculo.color}
                  onChange={(e) => setEditedVehiculo({ ...editedVehiculo, color: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placas">Placas</Label>
                <Input
                  id="placas"
                  value={isEditing ? editedVehiculo.placas : vehiculo.placas}
                  onChange={(e) => setEditedVehiculo({ ...editedVehiculo, placas: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>

          {/* Reseñas */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6 text-card-foreground">Reseñas recibidas</h2>
            <div className="space-y-4">
              {resenasEjemplo.map((resena) => (
                <div key={resena.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={resena.autorFoto || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {resena.autor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-card-foreground">{resena.autor}</p>
                        <Badge variant="secondary" className="text-xs">
                          {resena.tipoViaje === "conductor" ? "Como conductor" : "Como pasajero"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < resena.rating ? "fill-accent text-accent" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(resena.fecha).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{resena.comentario}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Columna derecha - Estadísticas */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6 text-card-foreground">Estadísticas</h2>
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 fill-accent text-accent" />
                  <span className="text-4xl font-bold text-foreground">{ratingPromedio.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Calificación promedio</p>
                <p className="text-xs text-muted-foreground mt-1">{resenasEjemplo.length} reseñas</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Viajes completados</span>
                  <span className="text-2xl font-bold text-foreground">{totalViajes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Como conductor</span>
                  <span className="text-lg font-semibold text-foreground">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Como pasajero</span>
                  <span className="text-lg font-semibold text-foreground">17</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Miembro desde</span>
                  <span className="font-medium text-foreground">Enero 2024</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última actividad</span>
                  <span className="font-medium text-foreground">Hace 2 días</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Insignias */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 text-card-foreground">Insignias</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center p-3 bg-accent/10 rounded-lg">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="text-xs font-medium text-center text-card-foreground">Conductor 5★</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-center text-card-foreground">25+ viajes</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
