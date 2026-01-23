"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Car, MapPin, Clock, Users, Star, Leaf, Shield, Zap, Menu, X, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image 
              src="/logos/udg.png" 
              alt="Universidad de Guadalajara" 
              width={40} 
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <span className="text-lg sm:text-2xl font-bold text-primary">Leoneta</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#como-funciona"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cómo funciona
            </Link>
            <Link
              href="#beneficios"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Beneficios
            </Link>
            <Link
              href="#seguridad"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Seguridad
            </Link>
              <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="#como-funciona"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cómo funciona
                </Link>
                <Link
                  href="#beneficios"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beneficios
                </Link>
                <Link
                  href="#seguridad"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Seguridad
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                    Iniciar sesión
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80">
        <div className="absolute inset-0 bg-[url('/abstract-university-pattern.png')] opacity-10 bg-cover bg-center" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-10 sm:py-14 lg:py-20 relative max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-3 sm:px-4 py-1.5 rounded-full mb-3 sm:mb-5 backdrop-blur-sm">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Comparte viajes, ahorra dinero, cuida el planeta</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-3 sm:mb-5 text-balance leading-tight">
                Viaja con tu comunidad universitaria
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-primary-foreground/90 mb-5 sm:mb-6 text-pretty leading-relaxed max-w-lg mx-auto lg:mx-0">
                Conecta con estudiantes y personal de tu universidad para compartir viajes de manera segura, económica y
                sostenible.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center lg:justify-start">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-sm sm:text-base px-5 sm:px-7 py-4 sm:py-5 h-auto shadow-xl hover:shadow-2xl transition-all"
                  >
                    Comenzar ahora
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 text-sm sm:text-base px-5 sm:px-7 py-4 sm:py-5 h-auto backdrop-blur-sm"
                >
                  Ver demo
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-primary-foreground/70 mt-3 sm:mt-5">
                ✓ Solo para miembros de la comunidad universitaria
              </p>
            </div>

            {/* Right content - Phone mockup */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                {/* Floating cards */}
                <div className="absolute -top-6 -left-6 sm:-left-12 lg:-left-16 z-10 animate-bounce-slow">
                  <Card className="p-3 sm:p-4 shadow-2xl bg-card/95 backdrop-blur-sm border-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Car className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-foreground">¡Nuevo ride!</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">CUCEI → Centro</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="absolute -bottom-6 -right-6 sm:-right-12 lg:-right-16 z-10 animate-float">
                  <Card className="p-3 sm:p-4 shadow-2xl bg-card/95 backdrop-blur-sm border-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-foreground">Ahorra 60%</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">En cada viaje</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Main phone image */}
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/logos/celular.png"
                    alt="App Leoneta - Notificación de nuevo viaje"
                    width={1600}
                    height={2000}
                    className="relative w-full h-auto drop-shadow-2xl"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-14 lg:gap-16">
            <Image
              src="/dinero-ahorrado.png"
              alt="Dinero ahorrado"
              width={1200}
              height={900}
              className="w-full rounded-3xl object-contain"
            />
            <Image
              src="/contribucion-ambiental.png"
              alt="Contribución ambiental"
              width={1200}
              height={900}
              className="w-full rounded-3xl object-contain"
            />
            <Image
              src="/estudiantes-conectados.png"
              alt="Estudiantes conectados"
              width={1200}
              height={900}
              className="w-full rounded-3xl object-contain"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 sm:py-20 md:py-24 bg-background scroll-mt-16 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Proceso simple
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 text-balance px-4">
              Cómo funciona Leoneta
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              Tres pasos sencillos para comenzar a compartir viajes
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card className="p-6 sm:p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 relative group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                </div>
                <div className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                  PASO 1
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-card-foreground">Regístrate</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Usa tu correo institucional para unirte a la comunidad de tu universidad
                </p>
              </div>
            </Card>
            <Card className="p-6 sm:p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-accent/50 relative group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent to-accent/70 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground" />
                </div>
                <div className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                  PASO 2
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-card-foreground">Busca o publica</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Encuentra viajes disponibles o publica tu ruta como conductor
                </p>
              </div>
            </Card>
            <Card className="p-6 sm:p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 relative group sm:col-span-2 md:col-span-1">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Car className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                </div>
                <div className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                  PASO 3
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-card-foreground">Viaja seguro</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Conecta con tu compañero de viaje y disfruta del trayecto
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-16 sm:py-20 md:py-24 bg-muted/30 scroll-mt-16 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                ¿Por qué elegirnos?
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 text-balance px-4">
              Beneficios de usar Leoneta
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              Más que solo compartir viajes, es una comunidad
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <Card className="p-6 sm:p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-accent/30 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">Ahorra dinero</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Comparte los gastos de gasolina y estacionamiento. Ahorra hasta 60% en cada viaje
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 sm:p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">Cuida el ambiente</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Reduce tu huella de carbono y contribuye a un planeta más verde
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 sm:p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-accent/30 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">Conoce gente</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Conecta con otros estudiantes y amplía tu red universitaria
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 sm:p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">Viaja seguro</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Solo miembros verificados de tu comunidad universitaria
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 sm:p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-accent/30 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">Flexibilidad total</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Encuentra viajes que se ajusten perfectamente a tu horario
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 sm:p-7 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30 group">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-card-foreground">Sistema de reseñas</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Califica y lee opiniones de otros usuarios de la comunidad
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="seguridad" className="py-16 sm:py-20 md:py-24 bg-primary text-primary-foreground scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-balance px-4">Tu seguridad es nuestra prioridad</h2>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 text-pretty leading-relaxed px-4">
              Solo estudiantes y personal verificado con correo institucional pueden unirse. Sistema de calificaciones y
              reseñas para mantener la confianza en la comunidad.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">100%</div>
                <div className="text-xs sm:text-sm text-primary-foreground/80">Usuarios verificados</div>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">24/7</div>
                <div className="text-xs sm:text-sm text-primary-foreground/80">Soporte disponible</div>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">4.8★</div>
                <div className="text-xs sm:text-sm text-primary-foreground/80">Calificación de seguridad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 text-balance px-4">
              Comienza a compartir viajes hoy
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 text-pretty px-4">
              Únete a miles de estudiantes que ya están ahorrando dinero y cuidando el planeta
            </p>
            <Link href="/login" className="inline-block w-full sm:w-auto px-4 sm:px-0">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Image 
                  src="/logos/udg.png" 
                  alt="Universidad de Guadalajara" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <span className="text-lg sm:text-xl font-bold text-primary">Leoneta</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Carpooling universitario seguro y sostenible
              </p>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-card-foreground">Producto</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cómo funciona
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Beneficios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Seguridad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-card-foreground">Soporte</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Centro de ayuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-card-foreground">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Términos de uso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 Leoneta. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
