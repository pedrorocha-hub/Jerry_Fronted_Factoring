-- ==========================================
-- TEST COMPLETO DEL AUDIT LOG
-- ==========================================

-- PASO 1: Verificar que la tabla existe y está vacía
SELECT 
    'PASO 1: Verificar tabla' as paso,
    COUNT(*) as logs_actuales
FROM ventas_mensuales_audit_log;

-- PASO 2: Obtener un ID de ventas_mensuales para prueba
SELECT 
    'PASO 2: IDs disponibles' as paso,
    id,
    proveedor_ruc,
    anio,
    enero,
    febrero
FROM ventas_mensuales
WHERE proveedor_ruc = '20556964620'
ORDER BY anio DESC
LIMIT 1;

-- PASO 3: Hacer un UPDATE manual (REEMPLAZA EL ID)
-- Copia un ID del PASO 2 y reemplázalo aquí:
/*
UPDATE ventas_mensuales 
SET febrero = COALESCE(febrero, 0) + 1
WHERE id = 'PEGA_AQUI_UN_ID';
*/

-- Ejemplo (usa un ID real):
-- UPDATE ventas_mensuales 
-- SET febrero = COALESCE(febrero, 0) + 1
-- WHERE id = 'e5f86cc7-b618-4e6e-be37-d65bd3fa7e51';

-- PASO 4: Verificar si se creó el log
SELECT 
    'PASO 4: Logs después del UPDATE manual' as paso,
    COUNT(*) as total_logs
FROM ventas_mensuales_audit_log;

-- PASO 5: Ver el detalle del log (si existe)
SELECT 
    'PASO 5: Detalle del último log' as paso,
    id,
    ventas_mensuales_id,
    user_email,
    action,
    changed_fields,
    old_values,
    new_values,
    created_at
FROM ventas_mensuales_audit_log
ORDER BY created_at DESC
LIMIT 1;

-- PASO 6: Si NO se creó el log, revisar si el trigger existe
SELECT 
    'PASO 6: Verificar triggers' as paso,
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'ventas_mensuales'
  AND trigger_name LIKE '%audit%';

-- PASO 7: Ver si hay algún error en los logs de Postgres
-- (Esto lo tienes que ver en Supabase Dashboard → Logs → Postgres Logs)
SELECT 'PASO 7: Revisa los Postgres Logs en el dashboard de Supabase' as instruccion;
