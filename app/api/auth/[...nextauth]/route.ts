import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        // Verifica que sea un correo institucional de UDG
        const email = profile?.email || "";
        const allowedDomains = ["academicos.udg.mx", "alumnos.udg.mx", "gmail.com"];
        const isAllowed = allowedDomains.some(domain => email.endsWith(`@${domain}`));
        
        if (!isAllowed) return false;

        // Verificar si el usuario existe en la base de datos
        const { data: existingUser } = await supabaseAdmin
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single();

        // Si no existe, crear un registro básico
        if (!existingUser) {
          await supabaseAdmin.from('usuarios').insert({
            email: email,
            nombre: profile?.name || "",
            foto: profile?.image,
            rol: email.includes("@academicos.udg.mx") ? "profesor" : "estudiante",
            registro_completo: false,
          });
        }

        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Si viene de un callback de OAuth, obtener el email del token
      if (url.includes("callback")) {
        // Extraer email de la URL o hacer query
        const urlObj = new URL(url, baseUrl);
        const searchParams = urlObj.searchParams;
        
        // Intentar obtener el email del callback (NextAuth lo pasa)
        // Como no podemos acceder directamente al token aquí, 
        // usaremos una estrategia diferente
        return url;
      }
      
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user, account, profile, trigger }) {
      // Agregar información del usuario al token en el primer login
      if (account && profile) {
        const email = profile.email as string;
        const { data: usuario } = await supabaseAdmin
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single();

        if (usuario) {
          token.registro_completo = usuario.registro_completo;
          token.id = usuario.id;
          token.rol = usuario.rol;
          token.carrera = usuario.carrera;
          token.telefono = usuario.telefono;
          token.direccion = usuario.direccion;
          token.acerca_de = usuario.acerca_de;
        }
      }
      
      // Si se actualiza la sesión, refrescar datos
      if (trigger === "update") {
        if (token.email) {
          const { data: usuario } = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('email', token.email as string)
            .single();

          if (usuario) {
            token.registro_completo = usuario.registro_completo;
            token.id = usuario.id;
            token.rol = usuario.rol;
            token.carrera = usuario.carrera;
            token.telefono = usuario.telefono;
            token.direccion = usuario.direccion;
            token.acerca_de = usuario.acerca_de;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Agregar información del token a la sesión
      if (session?.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          registro_completo: token.registro_completo as boolean,
          rol: token.rol as string,
          carrera: token.carrera as string | undefined,
          telefono: token.telefono as string | undefined,
          direccion: token.direccion as string | undefined,
          acerca_de: token.acerca_de as string | undefined,
        };
        
        // Si no completó registro, redirigir será manejado en el cliente
        // pero lo marcamos en la sesión
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
