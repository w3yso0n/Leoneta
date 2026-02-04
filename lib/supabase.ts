import { createClient } from '@supabase/supabase-js';

// Cliente para operaciones del navegador (con RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operaciones del servidor (sin RLS - admin)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Tipos para la base de datos
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  foto?: string;
  rol: 'estudiante' | 'profesor';
  carrera?: string;
  telefono?: string;
  direccion?: string;
  acerca_de?: string;
  registro_completo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  carrera: string;
  telefono: string;
  direccion: string;
  acerca_de: string;
}
