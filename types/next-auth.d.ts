import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      registro_completo: boolean;
      rol: string;
      carrera?: string;
      telefono?: string;
      direccion?: string;
      acerca_de?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    registro_completo: boolean;
    rol: string;
    carrera?: string;
    telefono?: string;
    direccion?: string;
    acerca_de?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    registro_completo: boolean;
    rol: string;
    carrera?: string;
    telefono?: string;
    direccion?: string;
    acerca_de?: string;
  }
}
