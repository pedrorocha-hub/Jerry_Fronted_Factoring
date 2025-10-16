-- ==========================================
-- PRUEBA PASO A PASO DEL AUDIT LOG
-- ==========================================

-- PASO 1: Obtener un ID válido de ventas_mensuales
SELECT 
    'IDs disponibles para prueba:' as paso,
    id,
    proveedor_ruc,
    anio,
    enero as valor_actual,
    solicitud_id
FROM ventas_mensuales 
WHERE proveedor_ruc = '20556964620'
ORDER BY anio DESC
LIMIT 3;

-- PASO 2: Ver cuántos logs existen ANTES de la prueba
SELECT 
    'Logs ANTES de la prueba:' as paso,
    COUNT(*) as total_logs
FROM ventas_mensuales_audit_log;

-- PASO 3: EJECUTA ESTA ACTUALIZACIÓN
-- Reemplaza 'ID_AQUI' con uno de los IDs del PASO 1
/*
UPDATE ventas_mensuales 
SET enero = COALESCE(enero, 0) + 1
WHERE id = 'ID_AQUI';
*/

-- EJEMPLO (reemplaza el ID):
-- UPDATE ventas_mensuales 
-- SET enero = COALESCE(enero, 0) + 1
-- WHERE id = 'e5f86cc7-b618-4e6e-be37-d65bd3fa7e51';

-- PASO 4: Ver cuántos logs existen DESPUÉS de la actualización
SELECT 
    'Logs DESPUÉS de la prueba:' as paso,
    COUNT(*) as total_logs
FROM ventas_mensuales_audit_log;

-- PASO 5: Ver el último log creado
SELECT 
    'Último log creado:' as paso,
    id,
    action,
    user_email,
    changed_fields,
    old_values,
    new_values,
    created_at
FROM ventas_mensuales_audit_log
ORDER BY created_at DESC
LIMIT 1;

-- PASO 6: Ver todos los logs del RUC de prueba
SELECT 
    val.id,
    val.action,
    val.user_email,
    val.changed_fields,
    val.old_values,
    val.new_values,
    val.created_at,
    vm.proveedor_ruc,
    vm.anio
FROM ventas_mensuales_audit_log val
JOIN ventas_mensuales vm ON val.ventas_mensuales_id = vm.id
WHERE vm.proveedor_ruc = '20556964620'
ORDER BY val.created_at DESC;
