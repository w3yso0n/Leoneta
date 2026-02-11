-- =====================================================
-- LEONETA - Schema de Base de Datos PostgreSQL
-- Carpooling Universitario UDG
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Para geolocalización avanzada

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE rol_usuario AS ENUM ('estudiante', 'profesor');
CREATE TYPE genero_usuario AS ENUM ('masculino', 'femenino', 'otro', 'prefiero_no_decir');
CREATE TYPE estado_viaje AS ENUM ('activo', 'completado', 'cancelado', 'en_curso');
CREATE TYPE estado_reservacion AS ENUM ('pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada');
CREATE TYPE tipo_calificacion AS ENUM ('conductor', 'pasajero');
CREATE TYPE estado_mensaje AS ENUM ('enviado', 'entregado', 'leido');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'tarjeta', 'otro');

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL, -- UNIQUE via partial index (permite re-registro tras soft delete)
    password_hash VARCHAR(255), -- NULL si usa OAuth (Google)
    
    -- Información personal
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    foto_url TEXT,
    telefono VARCHAR(20),
    genero genero_usuario,
    
    -- Información académica
    rol rol_usuario NOT NULL DEFAULT 'estudiante',
    carrera VARCHAR(150),
    codigo_estudiante VARCHAR(20), -- Código UDG
    centro_universitario VARCHAR(100) DEFAULT 'CUCEI',
    
    -- Ubicación (usando PostGIS para geolocalización)
    direccion TEXT,
    colonia VARCHAR(100),
    ubicacion GEOGRAPHY(POINT, 4326), -- Reemplaza latitud/longitud separados
    
    -- Perfil
    acerca_de TEXT,
    
    -- Verificación y estado
    email_verificado BOOLEAN DEFAULT FALSE,
    telefono_verificado BOOLEAN DEFAULT FALSE,
    registro_completo BOOLEAN DEFAULT FALSE,
    cuenta_activa BOOLEAN DEFAULT TRUE,
    
    -- OAuth
    google_id VARCHAR(100), -- UNIQUE via partial index
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Estadísticas (desnormalizadas para rendimiento)
    rating_promedio DECIMAL(3, 2) DEFAULT 0.00,
    total_viajes_conductor INTEGER DEFAULT 0,
    total_viajes_pasajero INTEGER DEFAULT 0,
    total_calificaciones INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraint: debe tener al menos un método de autenticación
    CONSTRAINT check_metodo_acceso CHECK (
        password_hash IS NOT NULL OR google_id IS NOT NULL
    )
);

-- Índices para usuarios (partial unique indexes para permitir re-registro tras soft delete)
CREATE UNIQUE INDEX ux_usuarios_email ON usuarios(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ux_usuarios_google_id ON usuarios(google_id) WHERE google_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_usuarios_registro_completo ON usuarios(registro_completo) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_centro ON usuarios(centro_universitario) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_rating ON usuarios(rating_promedio DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_ubicacion ON usuarios USING GIST(ubicacion) WHERE deleted_at IS NULL;

-- =====================================================
-- TABLA: vehiculos
-- =====================================================
CREATE TABLE vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Información del vehículo
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INTEGER CHECK (anio >= 1990 AND anio <= EXTRACT(YEAR FROM NOW()) + 1),
    color VARCHAR(30) NOT NULL,
    placas VARCHAR(20),
    
    -- Capacidad total del vehículo (ej: 4 asientos de pasajeros)
    capacidad_pasajeros INTEGER NOT NULL CHECK (capacidad_pasajeros >= 1 AND capacidad_pasajeros <= 7),
    
    -- Verificación
    verificado BOOLEAN DEFAULT FALSE,
    foto_url TEXT,
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    es_principal BOOLEAN DEFAULT FALSE, -- Si tiene múltiples vehículos
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vehículos
CREATE INDEX idx_vehiculos_usuario ON vehiculos(usuario_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehiculos_activo ON vehiculos(activo) WHERE activo = TRUE AND deleted_at IS NULL;

-- =====================================================
-- TABLA: preferencias_viaje (catálogo)
-- =====================================================
CREATE TABLE preferencias_viaje (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    icono VARCHAR(50), -- nombre del icono a usar en frontend
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Insertar preferencias predefinidas
INSERT INTO preferencias_viaje (codigo, nombre, icono, descripcion) VALUES
    ('no_fumar', 'No fumar', 'cigarette-off', 'No se permite fumar en el vehículo'),
    ('musica_permitida', 'Música permitida', 'music', 'Se permite poner música durante el viaje'),
    ('silencio', 'Viaje en silencio', 'volume-x', 'Se prefiere un viaje tranquilo y silencioso'),
    ('equipaje_ligero', 'Equipaje ligero', 'briefcase', 'Solo equipaje pequeño o mochila'),
    ('mascotas_permitidas', 'Mascotas permitidas', 'paw-print', 'Se permiten mascotas pequeñas'),
    ('puntualidad', 'Puntualidad estricta', 'clock', 'Se requiere puntualidad'),
    ('aire_acondicionado', 'Aire acondicionado', 'thermometer-snowflake', 'Vehículo con A/C'),
    ('conversacion', 'Conversación', 'message-circle', 'Abierto a conversar durante el viaje');

-- =====================================================
-- TABLA: viajes
-- =====================================================
CREATE TABLE viajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE SET NULL,
    rutina_id UUID, -- Referencia a rutina si fue generado automáticamente (FK agregada después)
    
    -- Ruta con PostGIS
    origen TEXT NOT NULL,
    origen_ubicacion GEOGRAPHY(POINT, 4326),
    destino TEXT NOT NULL,
    destino_ubicacion GEOGRAPHY(POINT, 4326),
    
    -- Ubicación predeterminada CUCEI
    es_hacia_cucei BOOLEAN DEFAULT TRUE, -- TRUE = origen -> CUCEI, FALSE = CUCEI -> destino
    
    -- Fecha y hora
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    
    -- Capacidad y precio
    asientos_totales INTEGER NOT NULL CHECK (asientos_totales >= 1 AND asientos_totales <= 4),
    asientos_disponibles INTEGER NOT NULL CHECK (asientos_disponibles >= 0),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    
    -- Métodos de pago aceptados por el conductor
    metodos_pago metodo_pago[] NOT NULL DEFAULT '{efectivo}',
    
    -- Información adicional
    notas TEXT,
    distancia_km DECIMAL(6, 2),
    duracion_estimada_min INTEGER,
    
    -- Estado
    estado estado_viaje DEFAULT 'activo',
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT check_asientos CHECK (asientos_disponibles <= asientos_totales)
);

-- Índices para viajes
CREATE INDEX idx_viajes_conductor ON viajes(conductor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_viajes_fecha ON viajes(fecha) WHERE deleted_at IS NULL;
CREATE INDEX idx_viajes_estado ON viajes(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_viajes_busqueda ON viajes(fecha, hora, estado) WHERE estado = 'activo' AND deleted_at IS NULL;
CREATE INDEX idx_viajes_origen ON viajes USING gin(to_tsvector('spanish', origen)) WHERE deleted_at IS NULL;
CREATE INDEX idx_viajes_destino ON viajes USING gin(to_tsvector('spanish', destino)) WHERE deleted_at IS NULL;
CREATE INDEX idx_viajes_origen_geo ON viajes USING GIST(origen_ubicacion) WHERE deleted_at IS NULL;
CREATE INDEX idx_viajes_destino_geo ON viajes USING GIST(destino_ubicacion) WHERE deleted_at IS NULL;

-- =====================================================
-- TABLA: viajes_paradas (paradas intermedias)
-- =====================================================
CREATE TABLE viajes_paradas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
    
    -- Orden de la parada en la ruta (1, 2, 3...)
    orden INTEGER NOT NULL CHECK (orden >= 1),
    
    -- Ubicación de la parada
    nombre TEXT NOT NULL, -- Ej: "Forum Tlaquepaque", "Plaza del Sol"
    ubicacion GEOGRAPHY(POINT, 4326),
    
    -- Hora estimada de llegada a esta parada
    hora_estimada TIME,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(viaje_id, orden)
);

CREATE INDEX idx_viajes_paradas_viaje ON viajes_paradas(viaje_id);
CREATE INDEX idx_viajes_paradas_ubicacion ON viajes_paradas USING GIST(ubicacion);

-- =====================================================
-- TABLA: rutinas (viajes recurrentes/plantillas)
-- Los usuarios universitarios tienen horarios fijos. Esta tabla permite
-- crear plantillas que un CRON job puede usar para generar viajes automáticamente.
-- =====================================================
CREATE TYPE dia_semana AS ENUM ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo');

CREATE TABLE rutinas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE SET NULL,
    
    -- Nombre descriptivo (ej: "Ida a clases mañana")
    nombre VARCHAR(100) NOT NULL,
    
    -- Ruta
    origen TEXT NOT NULL,
    origen_ubicacion GEOGRAPHY(POINT, 4326),
    destino TEXT NOT NULL,
    destino_ubicacion GEOGRAPHY(POINT, 4326),
    es_hacia_cucei BOOLEAN DEFAULT TRUE,
    
    -- Horario
    hora TIME NOT NULL,
    dias_semana dia_semana[] NOT NULL, -- Array de días: {'lunes', 'miercoles', 'viernes'}
    
    -- Configuración del viaje
    asientos INTEGER NOT NULL CHECK (asientos >= 1 AND asientos <= 4),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    metodos_pago metodo_pago[] NOT NULL DEFAULT '{efectivo}',
    notas TEXT,
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE,
    
    -- Período de validez (opcional)
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE, -- NULL = indefinido
    
    -- Control de generación
    ultimo_viaje_generado DATE, -- Para evitar duplicados
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rutinas_conductor ON rutinas(conductor_id) WHERE deleted_at IS NULL AND activa = TRUE;
CREATE INDEX idx_rutinas_dias ON rutinas USING GIN(dias_semana) WHERE deleted_at IS NULL AND activa = TRUE;

-- Agregar FK de viajes a rutinas (circular reference, se agrega después)
ALTER TABLE viajes ADD CONSTRAINT fk_viajes_rutina 
    FOREIGN KEY (rutina_id) REFERENCES rutinas(id) ON DELETE SET NULL;

-- =====================================================
-- TABLA: rutinas_paradas (paradas intermedias de la rutina)
-- =====================================================
CREATE TABLE rutinas_paradas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rutina_id UUID NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL CHECK (orden >= 1),
    nombre TEXT NOT NULL,
    ubicacion GEOGRAPHY(POINT, 4326),
    minutos_desde_inicio INTEGER, -- Minutos después de la hora de salida
    UNIQUE(rutina_id, orden)
);

-- =====================================================
-- TABLA: rutinas_preferencias (preferencias de la plantilla)
-- =====================================================
CREATE TABLE rutinas_preferencias (
    rutina_id UUID NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    preferencia_id INTEGER NOT NULL REFERENCES preferencias_viaje(id) ON DELETE CASCADE,
    PRIMARY KEY (rutina_id, preferencia_id)
);

-- =====================================================
-- TABLA: viajes_preferencias (relación muchos a muchos)
-- =====================================================
CREATE TABLE viajes_preferencias (
    viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
    preferencia_id INTEGER NOT NULL REFERENCES preferencias_viaje(id) ON DELETE CASCADE,
    PRIMARY KEY (viaje_id, preferencia_id)
);

CREATE INDEX idx_viajes_preferencias_viaje ON viajes_preferencias(viaje_id);

-- =====================================================
-- TABLA: reservaciones
-- =====================================================
CREATE TABLE reservaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE RESTRICT,
    pasajero_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Detalles
    asientos_reservados INTEGER NOT NULL DEFAULT 1 CHECK (asientos_reservados >= 1),
    precio_acordado DECIMAL(10, 2),
    
    -- Punto de encuentro personalizado con PostGIS (referencia a parada intermedia opcional)
    parada_id UUID REFERENCES viajes_paradas(id) ON DELETE SET NULL,
    punto_encuentro TEXT,
    punto_encuentro_ubicacion GEOGRAPHY(POINT, 4326),
    
    -- Estado
    estado estado_reservacion DEFAULT 'pendiente',
    
    -- Notas
    mensaje_pasajero TEXT,
    mensaje_conductor TEXT,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmada_at TIMESTAMP WITH TIME ZONE,
    cancelada_at TIMESTAMP WITH TIME ZONE,
    
    -- La unicidad se maneja con partial unique index (permite re-reservar tras cancelación)
    -- Ver: ux_reservaciones_viaje_pasajero_activa
);

-- Forzar que INSERT siempre entre como 'pendiente' (A: evita insertar ya confirmada sin descontar asientos)
CREATE OR REPLACE FUNCTION forzar_estado_pendiente_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado != 'pendiente' THEN
        RAISE EXCEPTION 'Las reservaciones deben crearse con estado pendiente. Use UPDATE para confirmar.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_forzar_estado_pendiente
    BEFORE INSERT ON reservaciones
    FOR EACH ROW EXECUTE FUNCTION forzar_estado_pendiente_insert();

-- Índices para reservaciones
CREATE INDEX idx_reservaciones_viaje ON reservaciones(viaje_id) WHERE deleted_at IS NULL;

-- Evitar reservaciones duplicadas ACTIVAS (permite re-reservar tras cancelación/soft delete)
CREATE UNIQUE INDEX ux_reservaciones_viaje_pasajero_activa
    ON reservaciones(viaje_id, pasajero_id)
    WHERE deleted_at IS NULL AND estado IN ('pendiente', 'confirmada');
CREATE INDEX idx_reservaciones_pasajero ON reservaciones(pasajero_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservaciones_estado ON reservaciones(estado) WHERE deleted_at IS NULL;

-- =====================================================
-- TABLA: calificaciones
-- =====================================================
CREATE TABLE calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Quién califica a quién
    calificador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    calificado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Viaje relacionado
    viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE RESTRICT,
    reservacion_id UUID REFERENCES reservaciones(id) ON DELETE SET NULL,
    
    -- Tipo: conductor calificando pasajero o viceversa
    tipo tipo_calificacion NOT NULL,
    
    -- Calificación
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comentario TEXT,
    
    -- Ruta del viaje (desnormalizada para historial)
    ruta TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar calificaciones duplicadas por viaje
    UNIQUE(calificador_id, calificado_id, viaje_id)
);

-- Índices para calificaciones
CREATE INDEX idx_calificaciones_calificado ON calificaciones(calificado_id);
CREATE INDEX idx_calificaciones_calificador ON calificaciones(calificador_id);
CREATE INDEX idx_calificaciones_viaje ON calificaciones(viaje_id);
CREATE INDEX idx_calificaciones_tipo ON calificaciones(tipo);
CREATE INDEX idx_calificaciones_rating ON calificaciones(rating);

-- =====================================================
-- TABLA: conversaciones (para el chat)
-- =====================================================
CREATE TABLE conversaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participantes (ordenados para evitar duplicados)
    usuario1_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    usuario2_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Viaje relacionado (opcional, para contexto)
    viaje_id UUID REFERENCES viajes(id) ON DELETE SET NULL,
    
    -- Último mensaje (para ordenar conversaciones)
    ultimo_mensaje_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar conversaciones duplicadas
    UNIQUE(usuario1_id, usuario2_id),
    CONSTRAINT check_diferentes_usuarios CHECK (usuario1_id < usuario2_id)
);

-- Índices para conversaciones
CREATE INDEX idx_conversaciones_usuario1 ON conversaciones(usuario1_id);
CREATE INDEX idx_conversaciones_usuario2 ON conversaciones(usuario2_id);
CREATE INDEX idx_conversaciones_ultimo_mensaje ON conversaciones(ultimo_mensaje_at DESC);

-- =====================================================
-- TABLA: mensajes
-- =====================================================
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id UUID NOT NULL REFERENCES conversaciones(id) ON DELETE RESTRICT,
    
    -- Remitente
    emisor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Contenido
    contenido TEXT NOT NULL,
    
    -- Estado del mensaje
    estado estado_mensaje DEFAULT 'enviado',
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leido_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mensajes
CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_mensajes_emisor ON mensajes(emisor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_mensajes_fecha ON mensajes(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_mensajes_no_leidos ON mensajes(conversacion_id, estado) WHERE estado != 'leido' AND deleted_at IS NULL;

-- =====================================================
-- TABLA: notificaciones
-- =====================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Contenido
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50), -- 'reservacion', 'calificacion', 'mensaje', 'sistema'
    
    -- Referencia (opcional)
    viaje_id UUID REFERENCES viajes(id) ON DELETE SET NULL,
    reservacion_id UUID REFERENCES reservaciones(id) ON DELETE SET NULL,
    
    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leida_at TIMESTAMP WITH TIME ZONE
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(usuario_id, leida) WHERE leida = FALSE;
CREATE INDEX idx_notificaciones_fecha ON notificaciones(created_at DESC);

-- =====================================================
-- TABLA: reportes (para reportar usuarios/viajes)
-- =====================================================
CREATE TABLE reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Quién reporta (RESTRICT porque usamos soft delete)
    reportador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- A quién/qué se reporta
    reportado_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    viaje_id UUID REFERENCES viajes(id) ON DELETE SET NULL,
    
    -- Detalles
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    
    -- Estado
    revisado BOOLEAN DEFAULT FALSE,
    resolucion TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revisado_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLA: sesiones (para tokens/refresh tokens)
-- Las sesiones SÍ usan CASCADE porque son datos volátiles
-- =====================================================
CREATE TABLE sesiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Token
    refresh_token_hash VARCHAR(255) NOT NULL,
    
    -- Info del dispositivo
    user_agent TEXT,
    ip_address INET,
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para sesiones
CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(refresh_token_hash);
CREATE INDEX idx_sesiones_activas ON sesiones(usuario_id, activa) WHERE activa = TRUE;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at
    BEFORE UPDATE ON vehiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viajes_updated_at
    BEFORE UPDATE ON viajes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservaciones_updated_at
    BEFORE UPDATE ON reservaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rutinas_updated_at
    BEFORE UPDATE ON rutinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar asientos disponibles al confirmar/cancelar reservación
-- NOTA: Solo descuenta cuando estado cambia a 'confirmada', NO en INSERT con estado 'pendiente'
-- Usa bloqueo FOR UPDATE para evitar race conditions en confirmaciones simultáneas
CREATE OR REPLACE FUNCTION actualizar_asientos_viaje()
RETURNS TRIGGER AS $$
DECLARE
    v_asientos_actuales INTEGER;
BEGIN
    -- Solo actuar en cambios de estado, NO en INSERT (las pendientes no reservan asientos)
    IF TG_OP = 'UPDATE' THEN
        -- Cambio a confirmada: decrementar asientos
        IF OLD.estado != 'confirmada' AND NEW.estado = 'confirmada' THEN
            -- Bloqueo FOR UPDATE para evitar race conditions
            SELECT asientos_disponibles INTO v_asientos_actuales
            FROM viajes
            WHERE id = NEW.viaje_id
            FOR UPDATE;
            
            -- Verificar que hay asientos suficientes
            IF v_asientos_actuales < NEW.asientos_reservados THEN
                RAISE EXCEPTION 'No hay suficientes asientos disponibles';
            END IF;
            
            UPDATE viajes 
            SET asientos_disponibles = asientos_disponibles - NEW.asientos_reservados
            WHERE id = NEW.viaje_id;
            
        -- Cambio desde confirmada a cancelada/rechazada: incrementar asientos
        ELSIF OLD.estado = 'confirmada' AND NEW.estado IN ('cancelada', 'rechazada') THEN
            UPDATE viajes 
            SET asientos_disponibles = asientos_disponibles + OLD.asientos_reservados
            WHERE id = NEW.viaje_id;
        END IF;
        
        -- B) Soft delete de reservación confirmada SIN cambio de estado: liberar asientos
        -- Esto cubre el caso donde alguien setea deleted_at sin cambiar estado correctamente
        -- Solo libera si el estado NO cambió (evita double-release con el ELSIF anterior)
        IF OLD.deleted_at IS NULL 
           AND NEW.deleted_at IS NOT NULL 
           AND OLD.estado = 'confirmada' 
           AND NEW.estado = 'confirmada' THEN  -- estado no cambió
            UPDATE viajes 
            SET asientos_disponibles = asientos_disponibles + OLD.asientos_reservados
            WHERE id = NEW.viaje_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para cambios de estado
CREATE TRIGGER trigger_actualizar_asientos
    AFTER UPDATE OF estado ON reservaciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_asientos_viaje();

-- Trigger para soft delete (libera asientos si estaba confirmada)
CREATE TRIGGER trigger_asientos_soft_delete
    AFTER UPDATE OF deleted_at ON reservaciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_asientos_viaje();

-- Función para validar que asientos_totales no exceda capacidad del vehículo
-- y que no se reduzca por debajo de las reservaciones confirmadas
CREATE OR REPLACE FUNCTION validar_asientos_viaje()
RETURNS TRIGGER AS $$
DECLARE
    v_capacidad INTEGER;
    v_asientos_confirmados INTEGER;
BEGIN
    -- Solo validar si se especifica un vehículo
    IF NEW.vehiculo_id IS NOT NULL THEN
        SELECT capacidad_pasajeros INTO v_capacidad
        FROM vehiculos
        WHERE id = NEW.vehiculo_id;
        
        IF NEW.asientos_totales > v_capacidad THEN
            RAISE EXCEPTION 'asientos_totales (%) excede la capacidad del vehículo (%)', 
                NEW.asientos_totales, v_capacidad;
        END IF;
    END IF;
    
    -- En UPDATE: validar que no se reduzcan asientos por debajo de las reservas confirmadas
    IF TG_OP = 'UPDATE' AND NEW.asientos_totales < OLD.asientos_totales THEN
        SELECT COALESCE(SUM(asientos_reservados), 0) INTO v_asientos_confirmados
        FROM reservaciones
        WHERE viaje_id = NEW.id 
          AND estado = 'confirmada'
          AND deleted_at IS NULL;
        
        IF NEW.asientos_totales < v_asientos_confirmados THEN
            RAISE EXCEPTION 'No puedes reducir asientos_totales (%) por debajo de las reservaciones confirmadas (%)', 
                NEW.asientos_totales, v_asientos_confirmados;
        END IF;
        
        -- Recalcular asientos_disponibles correctamente
        NEW.asientos_disponibles := NEW.asientos_totales - v_asientos_confirmados;
    END IF;
    
    -- Asegurar que asientos_disponibles = asientos_totales en INSERT
    IF TG_OP = 'INSERT' THEN
        NEW.asientos_disponibles := NEW.asientos_totales;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_asientos_viaje
    BEFORE INSERT OR UPDATE OF asientos_totales, vehiculo_id ON viajes
    FOR EACH ROW EXECUTE FUNCTION validar_asientos_viaje();

-- Función para evitar que un conductor reserve su propio viaje
CREATE OR REPLACE FUNCTION validar_reservacion_no_propia()
RETURNS TRIGGER AS $$
DECLARE
    v_conductor_id UUID;
BEGIN
    SELECT conductor_id INTO v_conductor_id
    FROM viajes
    WHERE id = NEW.viaje_id;
    
    IF NEW.pasajero_id = v_conductor_id THEN
        RAISE EXCEPTION 'No puedes reservar tu propio viaje';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_reservacion_no_propia
    BEFORE INSERT OR UPDATE OF pasajero_id, viaje_id ON reservaciones
    FOR EACH ROW EXECUTE FUNCTION validar_reservacion_no_propia();

-- Función para actualizar rating promedio del usuario
CREATE OR REPLACE FUNCTION actualizar_rating_usuario()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usuarios
    SET 
        rating_promedio = (
            SELECT COALESCE(AVG(rating), 0)
            FROM calificaciones
            WHERE calificado_id = NEW.calificado_id
        ),
        total_calificaciones = (
            SELECT COUNT(*)
            FROM calificaciones
            WHERE calificado_id = NEW.calificado_id
        )
    WHERE id = NEW.calificado_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_rating
    AFTER INSERT ON calificaciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_rating_usuario();

-- Función para actualizar contador de viajes del usuario
CREATE OR REPLACE FUNCTION actualizar_contador_viajes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND (OLD IS NULL OR OLD.estado != 'completado') THEN
        -- Actualizar contador del conductor
        UPDATE usuarios 
        SET total_viajes_conductor = total_viajes_conductor + 1
        WHERE id = NEW.conductor_id;
        
        -- Actualizar contador de pasajeros
        UPDATE usuarios 
        SET total_viajes_pasajero = total_viajes_pasajero + 1
        WHERE id IN (
            SELECT pasajero_id 
            FROM reservaciones 
            WHERE viaje_id = NEW.id AND estado = 'confirmada'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contador_viajes
    AFTER UPDATE OF estado ON viajes
    FOR EACH ROW EXECUTE FUNCTION actualizar_contador_viajes();

-- Función para actualizar último mensaje en conversación
CREATE OR REPLACE FUNCTION actualizar_ultimo_mensaje_conversacion()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversaciones
    SET ultimo_mensaje_at = NEW.created_at
    WHERE id = NEW.conversacion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ultimo_mensaje
    AFTER INSERT ON mensajes
    FOR EACH ROW EXECUTE FUNCTION actualizar_ultimo_mensaje_conversacion();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de viajes activos con información del conductor
CREATE OR REPLACE VIEW viajes_activos AS
SELECT 
    v.*,
    u.nombre AS conductor_nombre,
    u.apellido AS conductor_apellido,
    u.foto_url AS conductor_foto,
    u.rating_promedio AS conductor_rating,
    u.total_viajes_conductor AS conductor_total_viajes,
    u.carrera AS conductor_carrera,
    u.genero AS conductor_genero,
    ve.marca AS vehiculo_marca,
    ve.modelo AS vehiculo_modelo,
    ve.color AS vehiculo_color,
    ARRAY_AGG(DISTINCT pv.nombre) FILTER (WHERE pv.nombre IS NOT NULL) AS preferencias
FROM viajes v
JOIN usuarios u ON v.conductor_id = u.id AND u.deleted_at IS NULL
LEFT JOIN vehiculos ve ON v.vehiculo_id = ve.id
LEFT JOIN viajes_preferencias vp ON v.id = vp.viaje_id
LEFT JOIN preferencias_viaje pv ON vp.preferencia_id = pv.id
WHERE v.estado = 'activo' 
  AND v.fecha >= CURRENT_DATE
  AND v.deleted_at IS NULL
GROUP BY v.id, u.id, ve.id;

-- Vista de reservaciones con detalles
CREATE OR REPLACE VIEW reservaciones_detalle AS
SELECT 
    r.*,
    v.origen,
    v.destino,
    v.fecha,
    v.hora,
    v.precio,
    u_conductor.nombre AS conductor_nombre,
    u_conductor.foto_url AS conductor_foto,
    u_pasajero.nombre AS pasajero_nombre,
    u_pasajero.foto_url AS pasajero_foto,
    u_pasajero.rating_promedio AS pasajero_rating
FROM reservaciones r
JOIN viajes v ON r.viaje_id = v.id AND v.deleted_at IS NULL
JOIN usuarios u_conductor ON v.conductor_id = u_conductor.id
JOIN usuarios u_pasajero ON r.pasajero_id = u_pasajero.id
WHERE r.deleted_at IS NULL;

-- =====================================================
-- DATOS INICIALES (Dominios UDG permitidos)
-- =====================================================

-- Tabla para dominios de correo permitidos
CREATE TABLE dominios_permitidos (
    id SERIAL PRIMARY KEY,
    dominio VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO dominios_permitidos (dominio, descripcion) VALUES
    ('academicos.udg.mx', 'Correo para académicos de la UDG'),
    ('alumnos.udg.mx', 'Correo para alumnos de la UDG');

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE usuarios IS 'Usuarios de la plataforma (estudiantes y profesores de UDG)';
COMMENT ON TABLE vehiculos IS 'Vehículos registrados por los conductores';
COMMENT ON TABLE viajes IS 'Viajes publicados por conductores';
COMMENT ON TABLE viajes_paradas IS 'Paradas intermedias en la ruta de un viaje';
COMMENT ON TABLE rutinas IS 'Plantillas de viajes recurrentes (para generar viajes automáticamente)';
COMMENT ON TABLE rutinas_paradas IS 'Paradas intermedias en la plantilla de rutina';
COMMENT ON TABLE reservaciones IS 'Reservaciones de pasajeros en viajes';
COMMENT ON TABLE calificaciones IS 'Calificaciones entre usuarios después de un viaje';
COMMENT ON TABLE conversaciones IS 'Conversaciones de chat entre usuarios';
COMMENT ON TABLE mensajes IS 'Mensajes individuales en una conversación';
COMMENT ON TABLE notificaciones IS 'Notificaciones push y del sistema';
COMMENT ON TABLE preferencias_viaje IS 'Catálogo de preferencias disponibles para viajes';

COMMENT ON COLUMN usuarios.rating_promedio IS 'Promedio de calificaciones recibidas (1-5)';
COMMENT ON COLUMN usuarios.deleted_at IS 'Soft delete: si no es NULL, el usuario está eliminado';
COMMENT ON COLUMN usuarios.ubicacion IS 'Punto geográfico PostGIS del usuario';
COMMENT ON COLUMN viajes.es_hacia_cucei IS 'TRUE si el destino es CUCEI, FALSE si el origen es CUCEI';
COMMENT ON COLUMN viajes.deleted_at IS 'Soft delete: si no es NULL, el viaje está eliminado';
COMMENT ON COLUMN viajes.rutina_id IS 'Si fue generado desde una rutina, referencia a la plantilla';
COMMENT ON COLUMN reservaciones.estado IS 'pendiente: esperando confirmación, confirmada: aceptada por conductor';
COMMENT ON COLUMN reservaciones.parada_id IS 'Parada intermedia donde el pasajero se sube (opcional)';
COMMENT ON COLUMN rutinas.dias_semana IS 'Array de días: {lunes, miercoles, viernes}';
COMMENT ON COLUMN rutinas.ultimo_viaje_generado IS 'Fecha del último viaje generado por CRON para evitar duplicados';
COMMENT ON COLUMN rutinas.metodos_pago IS 'Métodos de pago que se copiarán a los viajes generados automáticamente';

-- Relación de asientos:
-- vehiculos.capacidad_pasajeros = capacidad máxima física del vehículo
-- viajes.asientos_totales = cuántos ofrece el conductor para ESE viaje (≤ capacidad_pasajeros)
-- viajes.asientos_disponibles = asientos_totales - reservaciones confirmadas
COMMENT ON COLUMN vehiculos.capacidad_pasajeros IS 'Capacidad máxima de pasajeros del vehículo';
COMMENT ON COLUMN viajes.asientos_totales IS 'Asientos ofrecidos para este viaje (no puede exceder capacidad del vehículo)';
COMMENT ON COLUMN viajes.asientos_disponibles IS 'Asientos libres = asientos_totales - reservaciones confirmadas';
COMMENT ON COLUMN viajes.metodos_pago IS 'Array de métodos de pago aceptados: {efectivo, transferencia}';

-- =====================================================
-- ESTRATEGIA DE BORRADO: SOFT DELETE + ON DELETE RESTRICT
-- 
-- NUNCA borrar físicamente registros padres (usuarios, viajes, etc.).
-- Usar soft_delete_usuario(uuid) para marcar como borrado y propagar.
-- 
-- ON DELETE RESTRICT en todas las FKs core garantiza:
-- 1. Si alguien intenta DELETE físico, Postgres lo bloqueará
-- 2. Los NOT NULL constraints se mantienen válidos
-- 3. La integridad referencial está protegida
--
-- Excepciones (CASCADE permitido):
-- - sesiones: datos volátiles, OK borrar con el usuario físico
-- - viajes_paradas: datos secundarios del viaje
-- - rutinas_paradas: datos secundarios de la rutina
-- - viajes_preferencias/rutinas_preferencias: tablas junction
-- =====================================================

-- =====================================================
-- FUNCIONES HELPER PARA PostGIS
-- =====================================================

-- Función helper para crear puntos geográficos
CREATE OR REPLACE FUNCTION crear_punto(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS GEOGRAPHY AS $$
BEGIN
    RETURN ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para buscar viajes cercanos a una ubicación
-- Ejemplo: SELECT * FROM buscar_viajes_cercanos(-103.3468, 20.6597, 5000);
CREATE OR REPLACE FUNCTION buscar_viajes_cercanos(
    lng DOUBLE PRECISION,
    lat DOUBLE PRECISION,
    radio_metros INTEGER DEFAULT 3000
)
RETURNS TABLE (
    viaje_id UUID,
    origen TEXT,
    destino TEXT,
    fecha DATE,
    hora TIME,
    precio DECIMAL,
    asientos_disponibles INTEGER,
    distancia_metros DOUBLE PRECISION,
    conductor_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.origen,
        v.destino,
        v.fecha,
        v.hora,
        v.precio,
        v.asientos_disponibles,
        ST_Distance(
            v.origen_ubicacion,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY
        ) as distancia_metros,
        u.nombre
    FROM viajes v
    JOIN usuarios u ON v.conductor_id = u.id
    WHERE v.estado = 'activo'
      AND v.deleted_at IS NULL
      AND v.fecha >= CURRENT_DATE
      AND ST_DWithin(
          v.origen_ubicacion,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY,
          radio_metros
      )
    ORDER BY distancia_metros ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SOFT DELETE EN CASCADA PARA USUARIOS
-- Cuando un usuario es marcado como borrado, propaga el soft delete
-- a todos sus registros relacionados en una sola transacción.
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_usuario_cascada()
RETURNS TRIGGER AS $$
DECLARE
    v_ahora TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Solo actuar cuando se marca como borrado (deleted_at cambia de NULL a valor)
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        
        -- Desactivar cuenta
        NEW.cuenta_activa := FALSE;
        
        -- Soft delete de vehículos del usuario
        UPDATE vehiculos 
        SET deleted_at = v_ahora, activo = FALSE
        WHERE usuario_id = NEW.id AND deleted_at IS NULL;
        
        -- Soft delete de rutinas del usuario
        UPDATE rutinas 
        SET deleted_at = v_ahora, activa = FALSE
        WHERE conductor_id = NEW.id AND deleted_at IS NULL;
        
        -- Soft delete de viajes activos del usuario (como conductor)
        UPDATE viajes 
        SET deleted_at = v_ahora, estado = 'cancelado'
        WHERE conductor_id = NEW.id 
          AND deleted_at IS NULL 
          AND estado = 'activo';
        
        -- Soft delete de reservaciones pendientes del usuario (como pasajero)
        UPDATE reservaciones 
        SET deleted_at = v_ahora, estado = 'cancelada', cancelada_at = v_ahora
        WHERE pasajero_id = NEW.id 
          AND deleted_at IS NULL 
          AND estado IN ('pendiente', 'confirmada');
        
        -- Marcar conversaciones como inactivas
        UPDATE conversaciones 
        SET activa = FALSE
        WHERE (usuario1_id = NEW.id OR usuario2_id = NEW.id) 
          AND activa = TRUE;
        
        -- Invalidar todas las sesiones activas
        UPDATE sesiones 
        SET activa = FALSE
        WHERE usuario_id = NEW.id AND activa = TRUE;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_soft_delete_usuario_cascada
    BEFORE UPDATE OF deleted_at ON usuarios
    FOR EACH ROW EXECUTE FUNCTION soft_delete_usuario_cascada();

-- Función helper para uso desde el backend (NestJS)
-- Ejemplo: SELECT soft_delete_usuario('uuid-del-usuario');
CREATE OR REPLACE FUNCTION soft_delete_usuario(p_usuario_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE usuarios 
    SET deleted_at = NOW()
    WHERE id = p_usuario_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para restaurar un usuario borrado (por si se necesita)
CREATE OR REPLACE FUNCTION restaurar_usuario(p_usuario_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Restaurar usuario
    UPDATE usuarios 
    SET deleted_at = NULL, cuenta_activa = TRUE
    WHERE id = p_usuario_id AND deleted_at IS NOT NULL;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Restaurar vehículos
    UPDATE vehiculos 
    SET deleted_at = NULL, activo = TRUE
    WHERE usuario_id = p_usuario_id AND deleted_at IS NOT NULL;
    
    -- Restaurar rutinas (pero mantenerlas inactivas para revisión manual)
    UPDATE rutinas 
    SET deleted_at = NULL
    WHERE conductor_id = p_usuario_id AND deleted_at IS NOT NULL;
    
    -- NOTA: No restauramos viajes/reservaciones porque el estado del negocio
    -- pudo haber cambiado. El usuario debe crear nuevos viajes manualmente.
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de las funciones de soft delete
COMMENT ON FUNCTION soft_delete_usuario IS 'Marca un usuario como borrado y propaga soft delete a registros relacionados';
COMMENT ON FUNCTION restaurar_usuario IS 'Restaura un usuario borrado (no restaura viajes/reservaciones cancelados)';
