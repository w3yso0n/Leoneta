# Configuración de Supabase para Leoneta

## 1. Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Guarda las credenciales que te proporcione

## 2. Ejecutar el esquema de la base de datos

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el script

## 3. Configurar variables de entorno

Agrega estas variables a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Para obtener estas credenciales:**
- Ve a tu proyecto en Supabase
- Settings → API
- Copia **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copia **Project API keys** → anon/public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Para producción (Vercel)

Agrega las mismas variables de entorno en:
**Vercel → Project Settings → Environment Variables**

## 5. Estructura de la tabla `usuarios`

- `id`: UUID (generado automáticamente)
- `email`: Email del usuario (único)
- `nombre`: Nombre completo (de Google)
- `foto`: URL de la foto de perfil
- `rol`: 'estudiante' o 'profesor'
- `carrera`: Carrera que estudia/imparte
- `telefono`: Número de contacto
- `direccion`: Dirección del usuario
- `acerca_de`: Descripción personal (opcional)
- `registro_completo`: Boolean (false hasta completar el registro)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

## 6. Políticas de seguridad (RLS)

El esquema incluye Row Level Security para:
- Permitir que los usuarios vean perfiles
- Permitir que los usuarios actualicen su propio perfil
- Permitir inserción de nuevos usuarios
