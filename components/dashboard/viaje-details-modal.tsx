// components/dashboard/viaje-details-modal.tsx

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Car, CheckCircle, Clock, DollarSign, MapPin, MessageSquare, Star, Users } from "lucide-react"
import { useState } from "react"

interface ViajeDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  viaje: {
    id: string
    conductor: {
      nombre: string
      foto: string
      rating: number
      totalViajes: number
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
    notas?: string
  }
  onSolicitar?: () => void
  onAceptar?: () => void
  onChat?: () => void
}

export function ViajeDetailsModal({
  open,
  onOpenChange,
  viaje,
  onSolicitar,
  onAceptar,
  onChat,
}: ViajeDetailsModalProps) {
  const [solicitando, setSolicitando] = useState(false)
  const [solicitado, setSolicitado] = useState(false)

  const handleSolicitar = () => {
    setSolicitando(true)
    setTimeout(() => {
      setSolicitando(false)
      setSolicitado(true)
      onSolicitar?.()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Unirse al ride</DialogTitle>
          <DialogDescription>
            ¿Deseas unirte al ride de <strong>{viaje.conductor.nombre}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Conductor Info */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={viaje.conductor.foto || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {viaje.conductor.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{viaje.conductor.nombre}</h3>
              {viaje.conductor.carrera && <p className="text-sm text-muted-foreground">{viaje.conductor.carrera}</p>}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{viaje.conductor.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({viaje.conductor.totalViajes} viajes)</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ruta */}
          <div>
            <h4 className="font-bold mb-3 text-foreground">Ruta</h4>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">{viaje.origen}</p>
                  <Badge variant="secondary" className="text-xs">
                    Origen
                  </Badge>
                </div>
                <div className="h-8 border-l-2 border-dashed border-border ml-2 my-1" />
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{viaje.destino}</p>
                  <Badge variant="secondary" className="text-xs">
                    Destino
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles del viaje */}
          <div>
            <h4 className="font-bold mb-3 text-foreground">Detalles</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha y hora</p>
                  <p className="font-medium text-foreground">
                    {new Date(viaje.fecha).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-foreground">{viaje.hora}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Asientos disponibles</p>
                  <p className="font-medium text-foreground">{viaje.asientosDisponibles} asientos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Precio sugerido</p>
                  <p className="font-medium text-accent">${viaje.precioSugerido} MXN</p>
                  <p className="text-xs text-muted-foreground">por persona</p>
                </div>
              </div>
              {viaje.conductor.vehiculo && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Car className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vehículo</p>
                    <p className="font-medium text-foreground">
                      {viaje.conductor.vehiculo.marca} {viaje.conductor.vehiculo.modelo}
                    </p>
                    <p className="text-sm text-muted-foreground">{viaje.conductor.vehiculo.color}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferencias */}
          {viaje.preferencias.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-bold mb-3 text-foreground">Preferencias del viaje</h4>
                <div className="flex flex-wrap gap-2">
                  {viaje.preferencias.map((pref, index) => (
                    <Badge key={index} variant="secondary">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notas */}
          {viaje.notas && (
            <>
              <Separator />
              <div>
                <h4 className="font-bold mb-3 text-foreground">Notas adicionales</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{viaje.notas}</p>
              </div>
            </>
          )}

        {/* Confirmación */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSolicitar}
            disabled={solicitando}
            className="sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {solicitando ? "Confirmando..." : "Confirmar"}
          </Button>
          {onChat && (
            <Button onClick={onChat} variant="ghost" className="sm:w-auto">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
