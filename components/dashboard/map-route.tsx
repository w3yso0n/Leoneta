// components/dashboard/map-route.tsx

"use client"

import { config } from "@/lib/config"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef, useState } from "react"

export type MapRoutePoint = { lat: number; lng: number }

/** Pin de recogida con texto opcional en el hover (búsqueda de viajes). */
export type MapPickupPin = MapRoutePoint & {
  conductorNombre?: string
  hora?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function attachHoverPopup(marker: mapboxgl.Marker, mapInstance: mapboxgl.Map, html: string) {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 18,
    maxWidth: "280px",
    className: "map-route-pin-popup",
  }).setHTML(html)

  const el = marker.getElement()
  const onEnter = () => {
    popup.setLngLat(marker.getLngLat()).addTo(mapInstance)
  }
  const onLeave = () => {
    popup.remove()
  }
  el.addEventListener("mouseenter", onEnter)
  el.addEventListener("mouseleave", onLeave)
}

interface MapRouteProps {
  origin?: string
  destination?: string
  /** Si hay ≥2 puntos, se dibuja esta polilínea (p. ej. la misma que se guarda en BD). */
  routePoints?: MapRoutePoint[]
  /** Punto de encuentro al pulsar «Ver ruta»; solo para centrar si centerOnMeetingPoint. */
  meetingPoint?: MapRoutePoint | null
  /** Si true, centra el mapa en meetingPoint tras dibujar la ruta. */
  centerOnMeetingPoint?: boolean
  /** Puntos de recogida de todos los rides (se muestran siempre que existan). */
  pickupPoints?: MapPickupPin[]
  height?: string
  className?: string
  onOriginChange?: (location: string, coords: [number, number]) => void
  onDestinationChange?: (location: string, coords: [number, number]) => void
}

export function MapRoute({
  origin,
  destination,
  routePoints,
  meetingPoint,
  centerOnMeetingPoint,
  pickupPoints,
  height = "400px",
  className = "",
  onOriginChange,
  onDestinationChange,
}: MapRouteProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const routeLayerId = "route-layer"
  const routeUpdateGenerationRef = useRef(0)

  // Geocode function
  const geocode = async (address: string): Promise<[number, number] | null> => {
    if (!address || address.trim() === "") return null
    
    // Si la dirección es coordenadas (formato: lat,lng), parsearlas directamente
    const coordMatch = address.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1])
      const lng = parseFloat(coordMatch[2])
      return [lng, lat] // Mapbox usa [lng, lat]
    }
    
    try {
      const url = `${config.mapbox.geocodingUrl}/${encodeURIComponent(address)}.json?access_token=${config.mapbox.accessToken}&country=MX&proximity=-103.3494,20.6597`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center as [number, number]
      }
    } catch (error) {
      console.error("Error geocoding:", error)
    }
    return null
  }

  // Get route between two points
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${config.mapbox.accessToken}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry
      }
    } catch (error) {
      console.error("Error getting route:", error)
    }
    return null
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = config.mapbox.accessToken || ""

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-103.3494, 20.6597], // Guadalajara, Mexico
      zoom: 11,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Geocode and update markers
  useEffect(() => {
    if (!map.current) return

    let cancelled = false
    const generation = ++routeUpdateGenerationRef.current

    const removeRouteLayer = () => {
      const m = map.current
      if (!m) return
      if (m.getLayer(routeLayerId)) m.removeLayer(routeLayerId)
      if (m.getSource(routeLayerId)) m.removeSource(routeLayerId)
    }

    const updateMap = async () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      removeRouteLayer()

      let newOriginCoords: [number, number] | null = null
      let newDestCoords: [number, number] | null = null

      // Polilínea explícita (misma que backend / Directions ya procesada en la página)
      if (routePoints && routePoints.length >= 2 && map.current) {
        const coordinates = routePoints.map((p) => [p.lng, p.lat] as [number, number])
        const start = coordinates[0]
        const end = coordinates[coordinates.length - 1]

        const placeRoute = () => {
          if (cancelled || !map.current || generation !== routeUpdateGenerationRef.current) return
          if (!map.current.isStyleLoaded()) return
          removeRouteLayer()
          if (cancelled || generation !== routeUpdateGenerationRef.current) return

          map.current.addSource(routeLayerId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
              },
            },
          })

          map.current.addLayer({
            id: routeLayerId,
            type: "line",
            source: routeLayerId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
              "line-opacity": 0.75,
            },
          })

          const origenLabel = origin ? escapeHtml(origin) : "Origen"
          const markerOrigen = new mapboxgl.Marker({ color: "#22c55e" })
            .setLngLat(start)
            .addTo(map.current!)
          markersRef.current.push(markerOrigen)
          attachHoverPopup(
            markerOrigen,
            map.current,
            `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-0.5">Origen</p><p class="text-muted-foreground">${origenLabel}</p></div>`,
          )

          const destLabel = destination ? escapeHtml(destination) : "Destino"
          const markerDest = new mapboxgl.Marker({ color: "#ef4444" })
            .setLngLat(end)
            .addTo(map.current!)
          markersRef.current.push(markerDest)
          attachHoverPopup(
            markerDest,
            map.current,
            `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-0.5">Destino</p><p class="text-muted-foreground">${destLabel}</p></div>`,
          )

          const pickupsList = pickupPoints ?? []
          pickupsList.forEach((p) => {
            const lngLat: [number, number] = [p.lng, p.lat]
            const markerPickup = new mapboxgl.Marker({ color: "#a855f7" })
              .setLngLat(lngLat)
              .addTo(map.current!)
            markersRef.current.push(markerPickup)
            const nombre = escapeHtml(p.conductorNombre?.trim() || "Conductor")
            const horaRide = escapeHtml(p.hora?.trim() || "—")
            attachHoverPopup(
              markerPickup,
              map.current!,
              `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-1">Ride · Punto de recogida</p><p class="text-foreground">${nombre}</p><p class="text-muted-foreground mt-0.5">Hora de llegada (CUCEI): ${horaRide}</p></div>`,
            )
          })

          const boundsRoute = new mapboxgl.LngLatBounds()
          coordinates.forEach((c) => boundsRoute.extend(c))
          pickupsList.forEach((p) => boundsRoute.extend([p.lng, p.lat]))

          if (centerOnMeetingPoint && meetingPoint) {
            map.current.flyTo({
              center: [meetingPoint.lng, meetingPoint.lat],
              zoom: 14,
              duration: 1000,
            })
          } else {
            map.current.fitBounds(boundsRoute, { padding: 80, duration: 1000 })
          }
        }

        if (map.current.isStyleLoaded()) {
          placeRoute()
        } else {
          map.current.once("styledata", placeRoute)
        }
        return
      }

      // Geocode origin
      if (origin) {
        const coords = await geocode(origin)
        if (cancelled || !map.current) return
        if (coords) {
          newOriginCoords = coords
          setOriginCoords(coords)

          // Determinar el texto del popup
          let popupText = origin
          const coordMatch = origin.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
          if (coordMatch) {
            popupText = "Tu ubicación actual"
          }

          const marker = new mapboxgl.Marker({ color: "#22c55e" })
            .setLngLat(coords)
            .addTo(map.current!)
          markersRef.current.push(marker)
          attachHoverPopup(
            marker,
            map.current,
            `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-0.5">Origen</p><p class="text-muted-foreground">${escapeHtml(popupText)}</p></div>`,
          )
        }
      }

      // Geocode destination
      if (destination) {
        const coords = await geocode(destination)
        if (cancelled || !map.current) return
        if (coords) {
          newDestCoords = coords
          setDestCoords(coords)
          const marker = new mapboxgl.Marker({ color: "#ef4444" })
            .setLngLat(coords)
            .addTo(map.current!)
          markersRef.current.push(marker)
          attachHoverPopup(
            marker,
            map.current,
            `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-0.5">Destino</p><p class="text-muted-foreground">${escapeHtml(destination)}</p></div>`,
          )
        }
      }

      // Draw route if both points exist - usar las coordenadas recién geocodificadas
      if (newOriginCoords && newDestCoords && map.current) {
        const route = await getRoute(newOriginCoords, newDestCoords)
        if (cancelled || !map.current) return

        if (route && map.current.isStyleLoaded()) {
          if (cancelled || generation !== routeUpdateGenerationRef.current) return
          // Otra ejecución pudo añadir la misma fuente mientras esperábamos la Directions API
          removeRouteLayer()
          if (cancelled || generation !== routeUpdateGenerationRef.current) return

          map.current.addSource(routeLayerId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: route,
            },
          })

          map.current.addLayer({
            id: routeLayerId,
            type: "line",
            source: routeLayerId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
              "line-opacity": 0.75,
            },
          })

          const pickupsGeo = pickupPoints ?? []
          pickupsGeo.forEach((p) => {
            const lngLat: [number, number] = [p.lng, p.lat]
            const markerPickup = new mapboxgl.Marker({ color: "#a855f7" })
              .setLngLat(lngLat)
              .addTo(map.current!)
            markersRef.current.push(markerPickup)
            const nombre = escapeHtml(p.conductorNombre?.trim() || "Conductor")
            const horaRide = escapeHtml(p.hora?.trim() || "—")
            attachHoverPopup(
              markerPickup,
              map.current!,
              `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-1">Ride · Punto de recogida</p><p class="text-foreground">${nombre}</p><p class="text-muted-foreground mt-0.5">Hora de llegada (CUCEI): ${horaRide}</p></div>`,
            )
          })

          const boundsGeo = new mapboxgl.LngLatBounds()
          boundsGeo.extend(newOriginCoords)
          boundsGeo.extend(newDestCoords)
          pickupsGeo.forEach((p) => boundsGeo.extend([p.lng, p.lat]))

          if (centerOnMeetingPoint && meetingPoint) {
            map.current.flyTo({
              center: [meetingPoint.lng, meetingPoint.lat],
              zoom: 14,
              duration: 1000,
            })
          } else {
            map.current.fitBounds(boundsGeo, { padding: 80, duration: 1000 })
          }
        }
      } else if (newOriginCoords || newDestCoords) {
        if (cancelled || !map.current) return
        const pickupsPartial = pickupPoints ?? []
        pickupsPartial.forEach((p) => {
          const lngLat: [number, number] = [p.lng, p.lat]
          const markerPickup = new mapboxgl.Marker({ color: "#a855f7" })
            .setLngLat(lngLat)
            .addTo(map.current!)
          markersRef.current.push(markerPickup)
          const nombre = escapeHtml(p.conductorNombre?.trim() || "Conductor")
          const horaRide = escapeHtml(p.hora?.trim() || "—")
          attachHoverPopup(
            markerPickup,
            map.current!,
            `<div class="text-xs sm:text-sm leading-snug px-0.5"><p class="font-semibold text-foreground mb-1">Ride · Punto de recogida</p><p class="text-foreground">${nombre}</p><p class="text-muted-foreground mt-0.5">Hora de llegada (CUCEI): ${horaRide}</p></div>`,
          )
        })
        const coords = newOriginCoords || newDestCoords
        if (coords) {
          const b = new mapboxgl.LngLatBounds()
          b.extend(coords)
          pickupsPartial.forEach((p) => b.extend([p.lng, p.lat]))
          if (pickupsPartial.length > 0) {
            map.current.fitBounds(b, { padding: 80, duration: 1000 })
          } else {
            map.current.flyTo({ center: coords, zoom: 13, duration: 1000 })
          }
        }
      }
    }

    void updateMap()

    return () => {
      cancelled = true
    }
  }, [origin, destination, routePoints, meetingPoint, centerOnMeetingPoint, pickupPoints])

  return (
    <div 
      ref={mapContainer} 
      className={`w-full rounded-lg overflow-hidden border border-border ${className}`}
      style={{ height }}
    />
  )
}

