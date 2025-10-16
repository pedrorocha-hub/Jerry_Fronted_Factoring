-- ==========================================
-- DIAGNÓSTICO DE AUDIT LOG VENTAS MENSUALES
-- ==========================================

-- 1. Verificar que la tabla existe
SELECT 'Tabla existe:' as test, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'ventas_mensuales_audit_log'
       ) THEN '✅ SÍ' ELSE '❌ NO' END as resultado;

-- 2. Verificar que los triggers existen
SELECT 'Triggers:' as test, COUNT(*) || ' triggers encontrados' as resultado
FROM information_schema.triggers 
WHERE trigger_name LIKE 'ventas_mensuales_audit%';

-- 3. Ver los triggers en detalle
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE 'ventas_mensuales_audit%';

-- 4. Verificar RLS
SELECT 'RLS habilitado:' as test,
       CASE WHEN relrowsecurity THEN '✅ SÍ' ELSE '❌ NO' END as resultado
FROM pg_class
WHERE relname = 'ventas_mensuales_audit_log';

-- 5. Ver políticas de RLS
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'ventas_mensuales_audit_log';

-- 6. Ver si hay ALGÚN log en la tabla
SELECT 'Total de logs:' as test, COUNT(*)::text || ' registros' as resultado
FROM ventas_mensuales_audit_log;

-- 7. Ver los últimos 10 logs (si existen)
SELECT 
    id,
    action,
    user_email,
    changed_fields,
    created_at
FROM ventas_mensuales_audit_log
ORDER BY created_at DESC
LIMIT 10;

-- 8. PRUEBA MANUAL: Actualizar un registro para ver si se genera log
-- IMPORTANTE: Cambia el ID por uno real de tu base de datos
-- Primero, obtén un ID válido:
SELECT id, proveedor_ruc, anio, enero 
FROM ventas_mensuales 
WHERE proveedor_ruc = '20556964620'
LIMIT 1;

-- Luego ejecuta esta actualización (REEMPLAZA el ID):
-- UPDATE ventas_mensuales 
-- SET enero = enero + 1
-- WHERE id = 'PEGA_AQUI_UN_ID_REAL';

-- Y verifica si se creó un log:
-- SELECT * FROM ventas_mensuales_audit_log 
-- ORDER BY created_at DESC 
-- LIMIT 1;
