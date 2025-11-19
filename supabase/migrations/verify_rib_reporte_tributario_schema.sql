-- Script para verificar el esquema de rib_reporte_tributario
-- Ejecuta esto para ver los tipos de datos actuales

SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'rib_reporte_tributario'
ORDER BY ordinal_position;

-- Si los tipos no coinciden, este script puede ayudar a identificar el problema
-- Específicamente revisar los tipos de: id, user_id, solicitud_id

