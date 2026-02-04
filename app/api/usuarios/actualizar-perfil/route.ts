import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre, telefono, carrera, direccion, acerca_de } = body;

    // Validar que se proporcionen los campos requeridos
    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Actualizar el usuario en la base de datos
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .update({
        nombre: nombre || null,
        telefono: telefono || null,
        carrera: carrera || null,
        direccion: direccion || null,
        acerca_de: acerca_de || null,
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
    console.error("Error en actualizar-perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
