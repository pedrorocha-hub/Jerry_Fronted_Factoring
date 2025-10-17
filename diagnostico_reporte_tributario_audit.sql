-- ==================================================================
-- SCRIPT DE DIAGNÓSTICO PARA AUDIT LOG DE REPORTE TRIBUTARIO
-- ==================================================================
-- Ejecuta este script en Supabase SQL Editor para diagnosticar el problema

-- 1. Verificar si la tabla de audit log existe
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'reporte_tributario_audit_log';

-- 2. Verificar la estructura de la tabla audit log
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'reporte_tributario_audit_log'
ORDER BY ordinal_position;

-- 3. Verificar el tipo de dato del ID en reporte_tributario
SELECT 
    column_name, 
    data_type,
    character_maximum_length,
    numeric_precision
FROM information_schema.columns
WHERE table_name = 'reporte_tributario' 
AND column_name = 'id';

-- 4. Verificar si los triggers existen
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'reporte_tributario_audit%'
ORDER BY trigger_name;

-- 5. Verificar las políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'reporte_tributario_audit_log';

-- 6. Verificar si la función trigger existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'reporte_tributario_audit_trigger';

-- 7. Intentar ver si hay logs (si la tabla existe)
SELECT COUNT(*) as total_logs 
FROM reporte_tributario_audit_log;

-- 8. Ver los últimos 5 logs si existen
SELECT 
    id,
    reporte_tributario_id,
    action,
    user_email,
    created_at
FROM reporte_tributario_audit_log
ORDER BY created_at DESC
LIMIT 5;

-- ==================================================================
-- RESULTADO ESPERADO:
-- - La tabla debe existir
-- - Debe tener 3 triggers (insert, update, delete)
-- - Debe tener 2 políticas RLS
-- - La función trigger debe existir
-- - El tipo de dato de reporte_tributario_id debe coincidir con el tipo de id en reporte_tributario
-- ==================================================================

