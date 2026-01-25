"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, List, User, Star, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

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
        <aside className="hidden lg:flex fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
          <div className="flex flex-col h-full w-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
              <Image 
                src="/logos/udg.png" 
                alt="Universidad de Guadalajara" 
                width={48} 
                height={48}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-sidebar-foreground">Leoneta</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.foto} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                    {user?.rol}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
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
