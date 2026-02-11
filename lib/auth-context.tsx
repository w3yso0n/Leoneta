"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  authApi,
  usersApi,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  type ApiUser,
} from "./api";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: "estudiante" | "profesor";
  universidad: string;
  foto?: string;
  registroCompleto: boolean;
  telefono?: string;
  carrera?: string;
  direccion?: string;
  acercaDe?: string;
  codigoEstudiante?: string;
  centroUniversitario?: string;
  genero?: string;
  ratingPromedio?: number;
  totalViajesConductor?: number;
  totalViajesPasajero?: number;
  totalCalificaciones?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  register: (payload: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: "estudiante" | "profesor";
  }) => Promise<boolean>;
  loginWithGoogle: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    apellido: u.apellido || "",
    rol: (u.rol as "estudiante" | "profesor") || "estudiante",
    universidad: u.centroUniversitario || "Universidad de Guadalajara",
    foto: u.fotoUrl,
    registroCompleto: u.registroCompleto,
    telefono: u.telefono,
    carrera: u.carrera,
    direccion: u.direccion,
    acercaDe: u.acercaDe,
    codigoEstudiante: u.codigoEstudiante,
    centroUniversitario: u.centroUniversitario,
    genero: u.genero,
    ratingPromedio: u.ratingPromedio,
    totalViajesConductor: u.totalViajesConductor,
    totalViajesPasajero: u.totalViajesPasajero,
    totalCalificaciones: u.totalCalificaciones,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from stored token on mount
  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const apiUser = await authApi.me();
      setUser(mapApiUser(apiUser));
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, password);
      setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      setUser(mapApiUser(res.user));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: "estudiante" | "profesor";
  }): Promise<boolean> => {
    try {
      const res = await authApi.register({
        email: payload.email,
        password: payload.password,
        nombre: payload.nombre,
        apellido: payload.apellido,
        rol: payload.rol,
      });
      setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      setUser(mapApiUser(res.user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      await authApi.logout(refreshToken || undefined);
    } catch {
      // Ignore errors on logout
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const loginWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = authApi.getGoogleUrl();
  };

  const refreshUser = async () => {
    try {
      const apiUser = await authApi.me();
      setUser(mapApiUser(apiUser));
    } catch {
      // silently fail 
    }
  };

  // Handle OAuth callback tokens from URL (for Google OAuth redirect)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("accessToken");
      url.searchParams.delete("refreshToken");
      url.searchParams.delete("registroCompleto");
      window.history.replaceState({}, "", url.pathname);
      // Load user with new tokens
      loadUser();
    }
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, register, loginWithGoogle, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}