import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
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
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Verifica que sea un correo institucional de UDG
        const email = profile?.email || "";
        const allowedDomains = ["academicos.udg.mx", "alumnos.udg.mx", "gmail.com"];
        const isAllowed = allowedDomains.some(domain => email.endsWith(`@${domain}`));
        return isAllowed;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirige al dashboard después del login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
});

export { handler as GET, handler as POST };
