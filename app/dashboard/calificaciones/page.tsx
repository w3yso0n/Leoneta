// app/dashboard/calificaciones/page.tsx

"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

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

export default function CalificacionesPage() {
  const ratingPromedio = todasLasResenas.reduce((acc, r) => acc + r.rating, 0) / todasLasResenas.length

  return (
    <div>
      <PageHeader title="Calificaciones" description="Todas las reseñas que has recibido de otros usuarios" />

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
    </div>
  )
}
