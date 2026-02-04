import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos actualizados del usuario
    const { data: usuario } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      user: usuario,
      registro_completo: usuario.registro_completo 
    }, { status: 200 });
  } catch (error) {
    console.error("Error al verificar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
