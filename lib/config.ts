// Configuración centralizada para variables de entorno
export const config = {
  // Backend API (NestJS en puerto 3001 con prefijo /api)
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Mapbox (para geocoding)
  mapbox: {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    geocodingUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  },
  
} as const

