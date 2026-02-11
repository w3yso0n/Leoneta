// app/dashboard/perfil/page.tsx

"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Car, Edit, FileCheck2, Loader2, Mail, MapPin, Navigation, Phone, Save, ShieldCheck, Star, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { usersApi, vehiclesApi, type ApiVehicle } from "@/lib/api"
import { toast } from "sonner"

export default function PerfilPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [geolocalizando, setGeolocalizando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  
  // Cargar datos desde el contexto de auth
  const [perfil, setPerfil] = useState({
    nombre: "",
    email: "",
    telefono: "",
    carrera: "",
    departamento: "CUCEI",
    ubicacion: "",
    colonia: "",
    foto: "",
  })

  // Cargar datos del usuario cuando esté listo
  useEffect(() => {
    if (user) {
      setPerfil({
        nombre: `${user.nombre} ${user.apellido}`.trim(),
        email: user.email || "",
        telefono: user.telefono || "",
        carrera: user.carrera || "",
        departamento: user.centroUniversitario || "CUCEI",
        ubicacion: user.direccion || "",
        colonia: "",
        foto: user.foto || "",
      })
      setEditedPerfil({
        nombre: `${user.nombre} ${user.apellido}`.trim(),
        email: user.email || "",
        telefono: user.telefono || "",
        carrera: user.carrera || "",
        departamento: user.centroUniversitario || "CUCEI",
        ubicacion: user.direccion || "",
        colonia: "",
        foto: user.foto || "",
      })
      setBio(user.acercaDe || "")
    }
  }, [user])

  // Cargar vehículos reales
  useEffect(() => {
    async function loadVehicles() {
      setLoadingVehicles(true)
      try {
        const all = await vehiclesApi.getMyVehicles()
        setVehicles(all.filter((v) => v.estado === "activo"))
      } catch {
        setVehicles([])
      } finally {
        setLoadingVehicles(false)
      }
    }
    loadVehicles()
  }, [])

  const [editedPerfil, setEditedPerfil] = useState(perfil)
  const [preferencias, setPreferencias] = useState({
    noFumar: true,
    musica: true,
    conversar: false,
    puntualidad: true,
  })
  const [bio, setBio] = useState("")

  const isPerfilValido =
    editedPerfil.nombre.trim() !== "" &&
    editedPerfil.email.trim() !== "" &&
    editedPerfil.telefono.trim() !== "" &&
    editedPerfil.ubicacion.trim() !== ""

  // Stats reales del usuario
  const ratingPromedio = user?.ratingPromedio ?? 0
  const totalViajesConductor = user?.totalViajesConductor ?? 0
  const totalViajesPasajero = user?.totalViajesPasajero ?? 0
  const totalViajes = totalViajesConductor + totalViajesPasajero
  const miembroDesde = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    : "—"

  const handleSave = async () => {
    if (!isPerfilValido || !user) return
    
    setLoading(true)
    
    try {
      await usersApi.updateProfile(user.id, {
        nombre: editedPerfil.nombre.split(" ")[0],
        apellido: editedPerfil.nombre.split(" ").slice(1).join(" "),
        telefono: editedPerfil.telefono,
        carrera: editedPerfil.carrera,
        direccion: editedPerfil.ubicacion,
        acercaDe: bio,
      })

      // Refrescar datos del usuario en contexto
      await refreshUser()

      setPerfil(editedPerfil)
      setIsEditing(false)
      setShowSuccess(true)
      toast.success("Perfil actualizado exitosamente")
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedPerfil(perfil)
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

  // Mostrar loading si no hay usuario aún
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Mi perfil" />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Calificación</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{ratingPromedio.toFixed(1)}</span>
            <Star className="w-4 h-4 fill-accent text-accent" />
          </div>
          <p className="text-xs text-muted-foreground">{user.totalCalificaciones ?? 0} calificaciones</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Viajes totales</p>
          <p className="text-3xl font-bold text-foreground">{totalViajes}</p>
          <p className="text-xs text-muted-foreground">{totalViajesConductor} como conductor · {totalViajesPasajero} como pasajero</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Verificación</p>
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Email UDG verificado
          </div>
          <p className="text-xs text-muted-foreground">Teléfono pendiente de confirmar</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-[11px]">INE requerido</Badge>
            <Badge variant="secondary" className="text-[11px]">Comprobante estudios</Badge>
          </div>
          <Button size="sm" variant="outline" className="w-full justify-center" type="button">
            <FileCheck2 className="w-4 h-4 mr-2" />
            Verificar documentos
          </Button>
        </Card>
      </div>

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
                  <Button size="sm" onClick={handleSave} className="bg-accent hover:bg-accent/90" disabled={!isPerfilValido || loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
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
                    value={perfil.nombre}
                    disabled={true}
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">El nombre no puede ser modificado</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <Input
                      id="carrera"
                      value={perfil.carrera}
                      disabled={true}
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">La carrera no puede ser modificada</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escuela">Escuela</Label>
                    <Input
                      id="escuela"
                      value={perfil.departamento}
                      disabled={true}
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Acerca de ti</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="text-sm"
                    placeholder="Agrega una breve bio para que otros sepan cómo prefieres viajar"
                  />
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

          {/* Vehículos */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-card-foreground">Mis vehículos</h2>
            </div>

            {loadingVehicles ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Cargando vehículos...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-6">
                <Car className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No tienes vehículos registrados</p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard/publicar"}>
                  Registrar vehículo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <Car className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">
                        {v.marca} {v.modelo} ({v.anio})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.color} · {v.capacidadPasajeros} pasajeros
                        {v.placas ? ` · ${v.placas}` : ""}
                      </p>
                    </div>
                    {v.esPrincipal && (
                      <Badge variant="secondary" className="text-xs">Principal</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                <p className="text-xs text-muted-foreground mt-1">{user?.totalCalificaciones ?? 0} calificaciones</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Viajes completados</span>
                  <span className="text-2xl font-bold text-foreground">{totalViajes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Como conductor</span>
                  <span className="text-lg font-semibold text-foreground">{totalViajesConductor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Como pasajero</span>
                  <span className="text-lg font-semibold text-foreground">{totalViajesPasajero}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Miembro desde</span>
                  <span className="font-medium text-foreground capitalize">{miembroDesde}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Insignias */}
          {(ratingPromedio >= 4.5 || totalViajes >= 10) && (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 text-card-foreground">Insignias</h2>
            <div className="grid grid-cols-2 gap-3">
              {ratingPromedio >= 4.5 && (
              <div className="flex flex-col items-center p-3 bg-accent/10 rounded-lg">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="text-xs font-medium text-center text-card-foreground">Top rating</span>
              </div>
              )}
              {totalViajes >= 10 && (
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-center text-card-foreground">{totalViajes}+ viajes</span>
              </div>
              )}
            </div>
          </Card>
          )}
          {/* Preferencias de viaje */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-card-foreground">Preferencias de viaje</h2>
            <div className="space-y-3">
              {[{
                key: "noFumar",
                label: "No fumar",
                desc: "Prefiero viajes libres de humo",
              }, {
                key: "musica",
                label: "Música",
                desc: "Ok con música durante el viaje",
              }, {
                key: "conversar",
                label: "Plática ligera",
                desc: "Me gusta conversar en el camino",
              }, {
                key: "puntualidad",
                label: "Puntualidad",
                desc: "Llego 5 minutos antes",
              }].map((pref) => (
                <label key={pref.key} className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={(preferencias as any)[pref.key]}
                    disabled={!isEditing}
                    onCheckedChange={(checked) => setPreferencias({ ...preferencias, [pref.key]: !!checked })}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-card-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {!isEditing && (
              <p className="text-xs text-muted-foreground">Activa edición para actualizar tus preferencias.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
