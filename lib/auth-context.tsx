"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: "estudiante" | "profesor";
  universidad: string;
  foto?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  register: (payload: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol: "estudiante" | "profesor";
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Adaptador interno que convierte Session (NextAuth) -> User (modelo Leoneta)
 */
function InnerAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = useMemo(() => {
    if (!session?.user?.email) return null;

    const email = session.user.email;
    const name = session.user.name ?? "";
    const [nombre = "", ...rest] = name.split(" ");
    const apellido = rest.join(" ");

    // TODO: ajustar rol/universidad cuando exista backend
    return {
      id: email, // temporal: usar email como id hasta tener DB
      email,
      nombre,
      apellido,
      rol: "estudiante",
      universidad: "Universidad de Guadalajara",
      foto: session.user.image ?? undefined,
    };
  }, [session]);

  const isLoading = status === "loading";

  const login = async (): Promise<boolean> => {
    // Redirige a OAuth Google. Si quieres, puedes pasar callbackUrl.
    await signIn("google", { callbackUrl: "/" });
    // signIn redirige; si no redirige, asumimos false
    return true;
  };

  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  const register = async (): Promise<boolean> => {
    // Con Google OAuth, el "registro" real se hace cuando exista backend.
    // Por ahora: puedes retornar false o true según tu UX.
    // Recomendación: true y mandar a signIn("google")
    await signIn("google", { callbackUrl: "/" });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}