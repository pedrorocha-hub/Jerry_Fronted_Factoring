-- ==================================================================
-- SCRIPT COMPLETO PARA CORREGIR comentarios_ejecutivo
-- ==================================================================
-- Este script corrige la tabla comentarios_ejecutivo agregando
-- la columna solicitud_id y todas las dependencias necesarias
-- ==================================================================

-- Paso 1: Verificar si la tabla solicitudes_operacion existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'solicitudes_operacion') THEN
        RAISE EXCEPTION 'La tabla solicitudes_operacion no existe. Esta tabla es requerida para la referencia.';
    END IF;
END $$;

-- Paso 2: Verificar si la tabla comentarios_ejecutivo existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comentarios_ejecutivo') THEN
        RAISE EXCEPTION 'La tabla comentarios_ejecutivo no existe. Ejecuta primero comentarios_ejecutivo_setup.sql';
    END IF;
END $$;

-- Paso 3: Agregar la columna solicitud_id si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comentarios_ejecutivo' 
        AND column_name = 'solicitud_id'
    ) THEN
        ALTER TABLE comentarios_ejecutivo 
        ADD COLUMN solicitud_id UUID REFERENCES solicitudes_operacion(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Columna solicitud_id agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna solicitud_id ya existe';
    END IF;
END $$;

-- Paso 4: Crear índices necesarios
CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_rib_id 
    ON comentarios_ejecutivo(rib_id);

CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_solicitud_id 
    ON comentarios_ejecutivo(solicitud_id);

CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_created_at 
    ON comentarios_ejecutivo(created_at);

-- Paso 5: Agregar constraint si no existe
DO $$
BEGIN
    -- Primero eliminar el constraint si existe (para evitar errores)
    ALTER TABLE comentarios_ejecutivo DROP CONSTRAINT IF EXISTS check_rib_or_solicitud;
    
    -- Agregar el constraint - SOLO solicitud_id es requerido
    ALTER TABLE comentarios_ejecutivo 
    ADD CONSTRAINT check_rib_or_solicitud CHECK (
        solicitud_id IS NOT NULL
    );
    
    RAISE NOTICE 'Constraint check_rib_or_solicitud agregado exitosamente';
END $$;

-- Paso 6: Habilitar RLS si no está habilitado
ALTER TABLE comentarios_ejecutivo ENABLE ROW LEVEL SECURITY;

-- Paso 7: Crear políticas RLS si no existen
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver comentarios" ON comentarios_ejecutivo;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar comentarios" ON comentarios_ejecutivo;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar comentarios" ON comentarios_ejecutivo;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar comentarios" ON comentarios_ejecutivo;

CREATE POLICY "Usuarios autenticados pueden ver comentarios" ON comentarios_ejecutivo
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar comentarios" ON comentarios_ejecutivo
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar comentarios" ON comentarios_ejecutivo
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar comentarios" ON comentarios_ejecutivo
    FOR DELETE USING (auth.role() = 'authenticated');

-- Paso 8: Crear función para updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Paso 9: Crear trigger para updated_at si no existe
DROP TRIGGER IF EXISTS update_comentarios_ejecutivo_updated_at ON comentarios_ejecutivo;
CREATE TRIGGER update_comentarios_ejecutivo_updated_at
    BEFORE UPDATE ON comentarios_ejecutivo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Paso 10: Actualizar comentarios
COMMENT ON TABLE comentarios_ejecutivo IS 'Tabla para almacenar comentarios del ejecutivo asociados a análisis RIB o solicitudes de operación';
COMMENT ON COLUMN comentarios_ejecutivo.rib_id IS 'ID del análisis RIB al que pertenece el comentario (opcional)';
COMMENT ON COLUMN comentarios_ejecutivo.solicitud_id IS 'ID de la solicitud de operación al que pertenece el comentario (opcional)';
COMMENT ON COLUMN comentarios_ejecutivo.comentario IS 'Texto del comentario del ejecutivo';
COMMENT ON COLUMN comentarios_ejecutivo.archivos_adjuntos IS 'Array de rutas de archivos adjuntos en storage';

-- Paso 11: Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comentarios_ejecutivo' 
ORDER BY ordinal_position;

-- Paso 12: Verificar índices
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'comentarios_ejecutivo';

-- Paso 13: Verificar constraints
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'comentarios_ejecutivo';

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- Si todo está correcto, deberías poder insertar comentarios
-- con solicitud_id sin problemas.
-- ==================================================================
