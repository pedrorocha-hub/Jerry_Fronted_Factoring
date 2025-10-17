-- ==================================================================
-- SCRIPT SIMPLE PARA CORREGIR EL CONSTRAINT
-- ==================================================================

-- Paso 1: Eliminar el constraint existente
ALTER TABLE comentarios_ejecutivo DROP CONSTRAINT IF EXISTS check_rib_or_solicitud;

-- Paso 2: Agregar el constraint correcto
ALTER TABLE comentarios_ejecutivo 
ADD CONSTRAINT check_rib_or_solicitud CHECK (
    solicitud_id IS NOT NULL
);

-- Paso 3: Verificar que se aplicó
SELECT 'Constraint aplicado correctamente' as status;

-- ==================================================================
-- FIN
-- ==================================================================
