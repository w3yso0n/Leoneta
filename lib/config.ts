// Configuración centralizada para variables de entorno
export const config = {
  // Backend API
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  
  // Mapbox (para geocoding)
  mapbox: {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    geocodingUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  },
  
} as const

