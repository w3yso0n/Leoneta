"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setTokens } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

/**
 * Handles the Google OAuth callback redirect from the NestJS backend.
 * URL format: /auth/callback?accessToken=...&refreshToken=...&registroCompleto=...
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const registroCompleto = params.get("registroCompleto");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);

      // Load user then redirect
      refreshUser().then(() => {
        if (registroCompleto === "false") {
          router.replace("/registro/completar");
        } else {
          router.replace("/dashboard");
        }
      });
    } else {
      // No tokens — redirect to login
      router.replace("/login");
    }
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  );
}
