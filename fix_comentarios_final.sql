-- ==================================================================
-- SCRIPT FINAL PARA CORREGIR comentarios_ejecutivo
-- ==================================================================
-- Elimina rib_id completamente y solo usa solicitud_id
-- ==================================================================

-- Paso 1: Eliminar el constraint existente
ALTER TABLE comentarios_ejecutivo DROP CONSTRAINT IF EXISTS check_rib_or_solicitud;

-- Paso 2: Eliminar la columna rib_id completamente
ALTER TABLE comentarios_ejecutivo DROP COLUMN IF EXISTS rib_id;

-- Paso 3: Eliminar el índice de rib_id si existe
DROP INDEX IF EXISTS idx_comentarios_ejecutivo_rib_id;

-- Paso 4: Agregar constraint que solo requiere solicitud_id
ALTER TABLE comentarios_ejecutivo 
ADD CONSTRAINT check_solicitud_required CHECK (
    solicitud_id IS NOT NULL
);

-- Paso 5: Verificar estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'comentarios_ejecutivo' 
ORDER BY ordinal_position;

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- Ahora la tabla solo tiene solicitud_id (requerido) y rib_id eliminado
-- ==================================================================
