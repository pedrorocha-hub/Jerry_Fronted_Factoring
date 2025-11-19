-- Script para depurar el trigger de auditoría

-- 1. Verificar que la tabla de audit log existe
SELECT 
    'rib_reporte_tributario_audit_log existe' as status,
    COUNT(*) as total_registros
FROM public.rib_reporte_tributario_audit_log;

-- 2. Verificar que el trigger existe y está activo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'rib_reporte_tributario'
ORDER BY trigger_name;

-- 3. Verificar que la función existe
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as function_definition_preview
FROM pg_proc
WHERE proname = 'log_rib_reporte_tributario_changes';

-- 4. Ver los últimos registros de audit log
SELECT 
    id,
    rib_reporte_tributario_id,
    user_full_name,
    action,
    changed_fields,
    created_at
FROM public.rib_reporte_tributario_audit_log
ORDER BY created_at DESC
LIMIT 10;

-- 5. Hacer una prueba de UPDATE en un registro existente
-- Primero, obtener un registro para probar
SELECT 
    id,
    anio,
    tipo_entidad,
    status,
    cuentas_por_cobrar_giro
FROM public.rib_reporte_tributario
LIMIT 1;

-- NOTA: Después de ver el resultado, ejecutar manualmente:
-- UPDATE public.rib_reporte_tributario 
-- SET cuentas_por_cobrar_giro = cuentas_por_cobrar_giro + 1
-- WHERE id = 'el_id_que_obtuviste'
--   AND anio = el_año
--   AND tipo_entidad = 'el_tipo';

-- Y luego verificar si se creó un registro de audit:
-- SELECT * FROM public.rib_reporte_tributario_audit_log 
-- WHERE rib_reporte_tributario_id = 'el_id_que_usaste'
-- ORDER BY created_at DESC LIMIT 1;

