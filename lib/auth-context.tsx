"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: "estudiante" | "profesor"
  universidad: string
  foto?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  register: (payload: { email: string; password: string; nombre: string; apellido: string; rol: "estudiante" | "profesor" }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuarios de prueba
const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: "1",
    email: "juan.perez@academicos.udg.mx",
    password: "demo123",
    nombre: "Juan",
    apellido: "Pérez",
    rol: "estudiante",
    universidad: "Universidad de Guadalajara",
    foto: "/placeholder-user.jpg",
  },
  {
    id: "2",
    email: "maria.gonzalez@academicos.udg.mx",
    password: "demo123",
    nombre: "María",
    apellido: "González",
    rol: "estudiante",
    universidad: "Universidad de Guadalajara",
    foto: "/placeholder-user.jpg",
  },
  {
    id: "3",
    email: "carlos.martinez@academicos.udg.mx",
    password: "demo123",
    nombre: "Carlos",
    apellido: "Martínez",
    rol: "profesor",
    universidad: "Universidad de Guadalajara",
    foto: "/placeholder-user.jpg",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem("leoneta_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular una llamada a API
    await new Promise((resolve) => setTimeout(resolve, 500))
    const stored = localStorage.getItem("leoneta_registered_users")
    const registered: Array<User & { password: string }> = stored ? JSON.parse(stored) : []
    const foundDemo = DEMO_USERS.find((u) => u.email === email && u.password === password)
    const foundRegistered = registered.find((u) => u.email === email && u.password === password)
    const foundUser = foundDemo || foundRegistered
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("leoneta_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("leoneta_user")
  }

  const register = async (payload: { email: string; password: string; nombre: string; apellido: string; rol: "estudiante" | "profesor" }): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const stored = localStorage.getItem("leoneta_registered_users")
    const registered: Array<User & { password: string }> = stored ? JSON.parse(stored) : []
    const existsInDemo = DEMO_USERS.some((u) => u.email === payload.email)
    const existsInRegistered = registered.some((u) => u.email === payload.email)
    if (existsInDemo || existsInRegistered) {
      return false
    }
    const newUser: User & { password: string } = {
      id: String(Date.now()),
      email: payload.email,
      password: payload.password,
      nombre: payload.nombre,
      apellido: payload.apellido,
      rol: payload.rol,
      universidad: "Universidad de Guadalajara",
      foto: "/placeholder-user.jpg",
    }
    const updated = [...registered, newUser]
    localStorage.setItem("leoneta_registered_users", JSON.stringify(updated))
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("leoneta_user", JSON.stringify(userWithoutPassword))
    return true
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

