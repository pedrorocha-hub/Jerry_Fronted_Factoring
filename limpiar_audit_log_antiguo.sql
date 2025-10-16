-- ==================================================================
-- SCRIPT OPCIONAL: Limpiar registros de audit log antiguos
-- ==================================================================
-- Este script elimina registros de audit log que pudieron haber
-- capturado demasiados campos antes de la optimización del trigger.
--
-- SOLO ejecuta este script si:
-- 1. Ya ejecutaste el script anterior sin la optimización
-- 2. Tienes registros con muchos campos irrelevantes
-- 3. Quieres empezar con un historial limpio
--
-- ADVERTENCIA: Esto eliminará TODOS los registros de audit log
-- existentes. Úsalo con precaución.
-- ==================================================================

-- Opción 1: Ver cuántos registros tienes actualmente
SELECT 
    COUNT(*) as total_registros,
    action,
    DATE(created_at) as fecha
FROM public.rib_reporte_tributario_audit_log
GROUP BY action, DATE(created_at)
ORDER BY fecha DESC;

-- Opción 2: ELIMINAR todos los registros antiguos (CUIDADO!)
-- Descomenta la siguiente línea solo si estás SEGURO de querer borrar todo:
-- DELETE FROM public.rib_reporte_tributario_audit_log;

-- Opción 3: Eliminar solo registros con muchos campos (más de 5)
-- Esto elimina registros que probablemente capturaron campos de sistema
-- Descomenta las siguientes líneas si quieres usar esta opción:
/*
DELETE FROM public.rib_reporte_tributario_audit_log
WHERE jsonb_object_keys(changed_fields) IS NOT NULL
  AND (SELECT COUNT(*) FROM jsonb_object_keys(changed_fields)) > 5;
*/

-- Opción 4: Ver un ejemplo de los registros actuales para decidir
SELECT 
    id,
    action,
    changed_fields,
    old_values,
    new_values,
    created_at
FROM public.rib_reporte_tributario_audit_log
ORDER BY created_at DESC
LIMIT 5;

-- ==================================================================
-- Después de limpiar (si decidiste hacerlo):
-- ==================================================================
-- Ahora ejecuta nuevamente el script principal:
-- rib_reporte_tributario_audit_log_setup.sql
--
-- Esto asegurará que el trigger optimizado esté en su lugar
-- y los futuros cambios solo capturen campos relevantes.
-- ==================================================================
