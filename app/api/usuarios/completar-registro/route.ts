import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, carrera, telefono, direccion, acerca_de } = body;

    // Validar que se proporcionen los campos requeridos
    if (!email || !carrera || !telefono || !direccion) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Actualizar el usuario en la base de datos
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .update({
        carrera,
        telefono,
        direccion,
        acerca_de: acerca_de || null,
        registro_completo: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar usuario:", error);
      return NextResponse.json(
        { error: "Error al actualizar el usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error en completar-registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
