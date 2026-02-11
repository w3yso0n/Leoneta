import { config } from './config';

// ─── Token Management ───────────────────────────────────────────────

const TOKEN_KEY = 'leoneta_access_token';
const REFRESH_KEY = 'leoneta_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Types ──────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  fotoUrl?: string;
  telefono?: string;
  genero?: string;
  rol: string;
  carrera?: string;
  codigoEstudiante?: string;
  centroUniversitario?: string;
  direccion?: string;
  colonia?: string;
  latitud?: number;
  longitud?: number;
  acercaDe?: string;
  emailVerificado?: boolean;
  telefonoVerificado?: boolean;
  registroCompleto: boolean;
  cuentaActiva?: boolean;
  ratingPromedio?: number;
  totalViajesConductor?: number;
  totalViajesPasajero?: number;
  totalCalificaciones?: number;
  createdAt?: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: ApiUser;
  tokens: TokensResponse;
}

export interface ApiVehicle {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  placas?: string;
  capacidadPasajeros: number;
  verificado: boolean;
  fotoUrl?: string;
  activo: boolean;
  esPrincipal: boolean;
  createdAt: string;
}

export interface ApiTrip {
  id: string;
  conductor?: ApiUser;
  conductorId?: string;
  vehiculo?: ApiVehicle;
  vehiculoId?: string;
  origen: string;
  destino: string;
  origenLatitud?: number;
  origenLongitud?: number;
  destinoLatitud?: number;
  destinoLongitud?: number;
  fecha: string;
  hora: string;
  asientosTotales: number;
  asientosDisponibles: number;
  precio: number;
  metodosPago: string[];
  estado: string;
  notas?: string;
  createdAt: string;
}

export interface ApiReservation {
  id: string;
  viaje?: ApiTrip;
  viajeId: string;
  pasajero?: ApiUser;
  pasajeroId: string;
  asientosReservados: number;
  estado: string;
  puntoEncuentroNombre?: string;
  puntoEncuentroLatitud?: number;
  puntoEncuentroLongitud?: number;
  mensajePasajero?: string;
  mensajeConductor?: string;
  confirmadaAt?: string;
  canceladaAt?: string;
  createdAt: string;
}

export interface UserStats {
  ratingPromedio: number;
  totalViajesConductor: number;
  totalViajesPasajero: number;
  totalCalificaciones: number;
}

// ─── API Client ─────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
    message?: string,
  ) {
    super(message || `API Error ${status}`);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data: TokensResponse = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 → try token refresh
  if (res.status === 401 && retry && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        return apiFetch<T>(path, options, false);
      } else {
        // Refresh failed — clear auth
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError(401, null, 'Sesión expirada');
      }
    }

    // Another request is already refreshing — wait for it
    return new Promise<T>((resolve, reject) => {
      addRefreshSubscriber((newToken: string) => {
        headers['Authorization'] = `Bearer ${newToken}`;
        fetch(`${config.apiUrl}${path}`, { ...options, headers })
          .then((r) => (r.ok ? r.json() : Promise.reject(new ApiError(r.status, null))))
          .then(resolve)
          .catch(reject);
      });
    });
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let data: any = null;
    try {
      data = await res.json();
    } catch {}
    throw new ApiError(res.status, data, data?.message || `Error ${res.status}`);
  }

  return res.json();
}

// ─── Auth API ───────────────────────────────────────────────────────

export const authApi = {
  register(dto: {
    email: string;
    password: string;
    nombre: string;
    apellido?: string;
    rol?: string;
    telefono?: string;
    carrera?: string;
  }): Promise<AuthResponse> {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me(): Promise<ApiUser> {
    return apiFetch('/auth/me');
  },

  logout(refreshToken?: string): Promise<void> {
    return apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  refresh(refreshToken: string): Promise<TokensResponse> {
    return apiFetch(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      false,
    );
  },

  getGoogleUrl(): string {
    return `${config.apiUrl}/auth/google`;
  },
};

// ─── Users API ──────────────────────────────────────────────────────

export const usersApi = {
  getProfile(id: string): Promise<ApiUser> {
    return apiFetch(`/usuarios/${id}`);
  },

  updateProfile(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
    return apiFetch(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  completeRegistration(
    id: string,
    data: {
      apellido?: string;
      telefono?: string;
      genero?: string;
      rol?: string;
      carrera?: string;
      codigoEstudiante?: string;
      centroUniversitario?: string;
      direccion?: string;
      acercaDe?: string;
    },
  ): Promise<ApiUser> {
    return apiFetch(`/usuarios/${id}/complete-registration`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getStats(id: string): Promise<UserStats> {
    return apiFetch(`/usuarios/${id}/stats`);
  },

  changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    return apiFetch(`/usuarios/${id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  updatePhoto(id: string, photoUrl: string): Promise<ApiUser> {
    return apiFetch(`/usuarios/${id}/photo`, {
      method: 'PATCH',
      body: JSON.stringify({ photoUrl }),
    });
  },
};

// ─── Vehicles API ───────────────────────────────────────────────────

export const vehiclesApi = {
  getMyVehicles(): Promise<ApiVehicle[]> {
    return apiFetch('/vehiculos');
  },

  create(data: {
    marca: string;
    modelo: string;
    anio: number;
    color: string;
    placas?: string;
    capacidadPasajeros?: number;
  }): Promise<ApiVehicle> {
    return apiFetch('/vehiculos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: Partial<{
      marca: string;
      modelo: string;
      anio: number;
      color: string;
      placas: string;
      capacidadPasajeros: number;
    }>,
  ): Promise<ApiVehicle> {
    return apiFetch(`/vehiculos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  setPrimary(id: string): Promise<ApiVehicle> {
    return apiFetch(`/vehiculos/${id}/principal`, {
      method: 'PATCH',
    });
  },

  setActive(id: string, activo: boolean): Promise<ApiVehicle> {
    return apiFetch(`/vehiculos/${id}/activo`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/vehiculos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─── Trips API ──────────────────────────────────────────────────────

export const tripsApi = {
  search(params?: {
    origen?: string;
    destino?: string;
    fecha?: string;
    hora?: string;
    precioMin?: number;
    precioMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: ApiTrip[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return apiFetch(`/viajes${qs ? `?${qs}` : ''}`);
  },

  getById(id: string): Promise<ApiTrip> {
    return apiFetch(`/viajes/${id}`);
  },

  getMyTrips(): Promise<ApiTrip[]> {
    return apiFetch('/viajes/mis-viajes');
  },

  create(data: {
    vehiculoId: string;
    origen: string;
    destino: string;
    origenLatitud?: number;
    origenLongitud?: number;
    destinoLatitud?: number;
    destinoLongitud?: number;
    fecha: string;
    hora: string;
    asientosTotales: number;
    precio: number;
    metodosPago?: string[];
    notas?: string;
  }): Promise<ApiTrip> {
    return apiFetch('/viajes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: Partial<{
      origen: string;
      destino: string;
      fecha: string;
      hora: string;
      precio: number;
      notas: string;
    }>,
  ): Promise<ApiTrip> {
    return apiFetch(`/viajes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  cancel(id: string): Promise<ApiTrip> {
    return apiFetch(`/viajes/${id}/cancelar`, {
      method: 'PATCH',
    });
  },

  start(id: string): Promise<ApiTrip> {
    return apiFetch(`/viajes/${id}/iniciar`, {
      method: 'PATCH',
    });
  },

  complete(id: string): Promise<ApiTrip> {
    return apiFetch(`/viajes/${id}/completar`, {
      method: 'PATCH',
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/viajes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─── Reservations API ───────────────────────────────────────────────

export const reservationsApi = {
  getMyReservations(): Promise<ApiReservation[]> {
    return apiFetch('/reservaciones/mis-reservaciones');
  },

  getByTrip(tripId: string): Promise<ApiReservation[]> {
    return apiFetch(`/reservaciones/viaje/${tripId}`);
  },

  create(data: {
    viajeId: string;
    asientosReservados?: number;
    puntoEncuentroNombre?: string;
    puntoEncuentroLatitud?: number;
    puntoEncuentroLongitud?: number;
    mensajePasajero?: string;
  }): Promise<ApiReservation> {
    return apiFetch('/reservaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirm(id: string, mensajeConductor?: string): Promise<ApiReservation> {
    return apiFetch(`/reservaciones/${id}/confirmar`, {
      method: 'PATCH',
      body: JSON.stringify({ mensajeConductor }),
    });
  },

  reject(id: string, mensajeConductor?: string): Promise<ApiReservation> {
    return apiFetch(`/reservaciones/${id}/rechazar`, {
      method: 'PATCH',
      body: JSON.stringify({ mensajeConductor }),
    });
  },

  cancel(id: string): Promise<ApiReservation> {
    return apiFetch(`/reservaciones/${id}/cancelar`, {
      method: 'PATCH',
    });
  },

  complete(id: string): Promise<ApiReservation> {
    return apiFetch(`/reservaciones/${id}/completar`, {
      method: 'PATCH',
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/reservaciones/${id}`, {
      method: 'DELETE',
    });
  },
};
