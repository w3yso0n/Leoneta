"use client"

import type React from "react"
import { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  Plus,
  List,
  User,
  Star,
  LogOut,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    try {
      if (localStorage.getItem("leoneta-sidebar-collapsed") === "1") {
        setSidebarCollapsed(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("leoneta-sidebar-collapsed", next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getUserInitials = () => {
    if (!user) return "US"
    return `${user.nombre[0]}${user.apellido[0]}`
  }

  const navigation = [
    { name: "Buscar", shortName: "Buscar", href: "/dashboard/buscar", icon: Search },
    { name: "Publicar", shortName: "Publicar", href: "/dashboard/publicar", icon: Plus },
    { name: "Mis viajes", shortName: "Viajes", href: "/dashboard/mis-viajes", icon: List },
    { name: "Perfil", shortName: "Perfil", href: "/dashboard/perfil", icon: User },
    { name: "Calificaciones", shortName: "Califica", href: "/dashboard/calificaciones", icon: Star },
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden border-b border-border bg-card sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/logos/udg.png" 
              alt="Universidad de Guadalajara" 
              width={32} 
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-bold text-primary">Leoneta</span>
          </Link>
          <Link href="/dashboard/calificaciones">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Star className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex fixed lg:sticky top-0 left-0 z-40 h-screen shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out",
            sidebarCollapsed ? "w-[4.5rem]" : "w-64",
          )}
        >
          <div className="flex h-full w-full flex-col">
            {/* Logo + colapsar */}
            <div
              className={cn(
                "flex border-b border-sidebar-border",
                sidebarCollapsed
                  ? "flex-col items-center gap-2 px-2 py-3"
                  : "items-center gap-3 px-4 py-4",
              )}
            >
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 min-w-0",
                  sidebarCollapsed && "justify-center",
                )}
              >
                <Image
                  src="/logos/udg.png"
                  alt="Universidad de Guadalajara"
                  width={40}
                  height={40}
                  className={cn("object-contain shrink-0", sidebarCollapsed ? "h-9 w-9" : "h-10 w-10")}
                />
                {!sidebarCollapsed && (
                  <span className="truncate text-xl font-bold text-sidebar-foreground">Leoneta</span>
                )}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSidebarCollapsed}
                className={cn(
                  "h-9 w-9 shrink-0 text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  !sidebarCollapsed && "ml-auto",
                )}
                aria-label={sidebarCollapsed ? "Expandir menú lateral" : "Minimizar menú lateral"}
                title={sidebarCollapsed ? "Expandir menú" : "Minimizar menú"}
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="h-5 w-5" />
                ) : (
                  <ChevronsLeft className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", sidebarCollapsed ? "px-1.5" : "px-3")}>
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-colors",
                      sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Profile */}
            <div
              className={cn(
                "border-t border-sidebar-border",
                sidebarCollapsed ? "flex flex-col items-center gap-2 p-2" : "p-4",
              )}
            >
              {sidebarCollapsed ? (
                <>
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={user?.foto} />
                    <AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                    disabled={!themeMounted}
                    title={themeMounted && resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
                    aria-label="Alternar modo claro u oscuro"
                    onClick={() =>
                      setTheme(themeMounted && resolvedTheme === "dark" ? "light" : "dark")
                    }
                  >
                    {themeMounted && resolvedTheme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-9 w-9 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user?.foto} />
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">
                          {user?.nombre} {user?.apellido}
                        </p>
                        <div
                          className="flex shrink-0 items-center gap-1.5"
                          title={themeMounted && resolvedTheme === "dark" ? "Modo oscuro" : "Modo claro"}
                        >
                          <Sun className="h-3.5 w-3.5 text-sidebar-foreground/50" aria-hidden />
                          <Switch
                            checked={themeMounted ? resolvedTheme === "dark" : false}
                            onCheckedChange={(on) => setTheme(on ? "dark" : "light")}
                            disabled={!themeMounted}
                            className="data-[state=checked]:bg-sidebar-primary"
                            aria-label="Alternar modo claro u oscuro"
                          />
                          <Moon className="h-3.5 w-3.5 text-sidebar-foreground/50" aria-hidden />
                        </div>
                      </div>
                      <p className="truncate text-xs capitalize text-sidebar-foreground/60">{user?.rol}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-primary",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
                )}
                <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.shortName}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      </div>
    </AuthGuard>
  )
}
