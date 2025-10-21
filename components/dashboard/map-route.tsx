// components/dashboard/map-route.tsx

"use client"

import { config } from "@/lib/config"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef, useState } from "react"

interface MapRouteProps {
  origin?: string
  destination?: string
  height?: string
  className?: string
  onOriginChange?: (location: string, coords: [number, number]) => void
  onDestinationChange?: (location: string, coords: [number, number]) => void
}

export function MapRoute({ 
  origin, 
  destination, 
  height = "400px", 
  className = "",
  onOriginChange,
  onDestinationChange
}: MapRouteProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const routeLayerId = "route-layer"

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

    const updateMap = async () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Remove existing route layer
      if (map.current?.getLayer(routeLayerId)) {
        map.current.removeLayer(routeLayerId)
      }
      if (map.current?.getSource(routeLayerId)) {
        map.current.removeSource(routeLayerId)
      }

      let newOriginCoords: [number, number] | null = null
      let newDestCoords: [number, number] | null = null

      // Geocode origin
      if (origin) {
        const coords = await geocode(origin)
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
            .setPopup(new mapboxgl.Popup().setHTML(`<p class="text-sm font-medium">Origen: ${popupText}</p>`))
            .addTo(map.current!)
          markersRef.current.push(marker)
        }
      }

      // Geocode destination
      if (destination) {
        const coords = await geocode(destination)
        if (coords) {
          newDestCoords = coords
          setDestCoords(coords)
          const marker = new mapboxgl.Marker({ color: "#ef4444" })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML(`<p class="text-sm font-medium">Destino: ${destination}</p>`))
            .addTo(map.current!)
          markersRef.current.push(marker)
        }
      }

      // Draw route if both points exist - usar las coordenadas recién geocodificadas
      if (newOriginCoords && newDestCoords && map.current) {
        const route = await getRoute(newOriginCoords, newDestCoords)
        
        if (route && map.current.isStyleLoaded()) {
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

          // Fit map to show entire route
          const bounds = new mapboxgl.LngLatBounds()
          bounds.extend(newOriginCoords)
          bounds.extend(newDestCoords)
          map.current.fitBounds(bounds, { padding: 80, duration: 1000 })
        }
      } else if (newOriginCoords || newDestCoords) {
        // Fit to single marker
        const coords = newOriginCoords || newDestCoords
        if (coords) {
          map.current.flyTo({ center: coords, zoom: 13, duration: 1000 })
        }
      }
    }

    updateMap()
  }, [origin, destination])

  return (
    <div 
      ref={mapContainer} 
      className={`w-full rounded-lg overflow-hidden border border-border ${className}`}
      style={{ height }}
    />
  )
}

