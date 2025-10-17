-- ==================================================================
-- SCRIPT PARA CORREGIR EL CONSTRAINT DE comentarios_ejecutivo
-- ==================================================================
-- Este script corrige el constraint para que solo requiera solicitud_id
-- ==================================================================

-- Paso 1: Eliminar el constraint existente
ALTER TABLE comentarios_ejecutivo DROP CONSTRAINT IF EXISTS check_rib_or_solicitud;

-- Paso 2: Agregar el constraint correcto
-- Solo solicitud_id es requerido, rib_id es opcional
ALTER TABLE comentarios_ejecutivo 
ADD CONSTRAINT check_rib_or_solicitud CHECK (
    solicitud_id IS NOT NULL
);

-- Paso 3: Verificar que el constraint se aplicó correctamente
SELECT 
    tc.constraint_name, 
    cc.check_clause 
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'comentarios_ejecutivo' 
AND tc.constraint_name = 'check_rib_or_solicitud';

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- Ahora deberías poder insertar comentarios con solo solicitud_id
-- ==================================================================
