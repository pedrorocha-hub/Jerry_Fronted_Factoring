-- ==================================================================
-- MIGRACIÓN PARA AGREGAR solicitud_id A comentarios_ejecutivo
-- ==================================================================
-- Este script agrega la columna solicitud_id a la tabla existente
-- y actualiza las restricciones necesarias
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Verificar si la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comentarios_ejecutivo') THEN
        RAISE EXCEPTION 'La tabla comentarios_ejecutivo no existe. Ejecuta primero comentarios_ejecutivo_setup.sql';
    END IF;
END $$;

-- Paso 2: Agregar la columna solicitud_id si no existe
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

-- Paso 3: Crear índice para solicitud_id si no existe
CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_solicitud_id 
    ON comentarios_ejecutivo(solicitud_id);

-- Paso 4: Agregar constraint si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_rib_or_solicitud'
    ) THEN
        ALTER TABLE comentarios_ejecutivo 
        ADD CONSTRAINT check_rib_or_solicitud CHECK (
            (rib_id IS NOT NULL AND solicitud_id IS NULL) OR 
            (rib_id IS NULL AND solicitud_id IS NOT NULL)
        );
        
        RAISE NOTICE 'Constraint check_rib_or_solicitud agregado exitosamente';
    ELSE
        RAISE NOTICE 'El constraint check_rib_or_solicitud ya existe';
    END IF;
END $$;

-- Paso 5: Actualizar comentarios de la tabla
COMMENT ON COLUMN comentarios_ejecutivo.solicitud_id IS 'ID de la solicitud de operación al que pertenece el comentario (opcional)';

-- Paso 6: Verificar que todo esté correcto
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comentarios_ejecutivo' 
ORDER BY ordinal_position;

-- ==================================================================
-- FIN DE LA MIGRACIÓN
-- ==================================================================
-- Verificar que la migración fue exitosa:
-- SELECT * FROM comentarios_ejecutivo LIMIT 1;
-- ==================================================================
