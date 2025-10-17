-- ==================================================================
-- SCRIPT DE VERIFICACIÓN PARA comentarios_ejecutivo
-- ==================================================================
-- Este script verifica el estado actual de la tabla comentarios_ejecutivo
-- y muestra qué columnas, índices y constraints existen
-- ==================================================================

-- Verificar si la tabla existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comentarios_ejecutivo') 
        THEN '✅ La tabla comentarios_ejecutivo EXISTE'
        ELSE '❌ La tabla comentarios_ejecutivo NO EXISTE'
    END as tabla_status;

-- Verificar columnas de la tabla
SELECT 
    'COLUMNAS DE LA TABLA:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comentarios_ejecutivo' 
ORDER BY ordinal_position;

-- Verificar si existe la columna solicitud_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'comentarios_ejecutivo' 
            AND column_name = 'solicitud_id'
        ) 
        THEN '✅ La columna solicitud_id EXISTE'
        ELSE '❌ La columna solicitud_id NO EXISTE - NECESITAS EJECUTAR LA MIGRACIÓN'
    END as solicitud_id_status;

-- Verificar índices
SELECT 
    'ÍNDICES DE LA TABLA:' as info,
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'comentarios_ejecutivo';

-- Verificar constraints
SELECT 
    'CONSTRAINTS DE LA TABLA:' as info,
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'comentarios_ejecutivo';

-- Verificar si RLS está habilitado
SELECT 
    CASE 
        WHEN relrowsecurity = true 
        THEN '✅ RLS está HABILITADO'
        ELSE '❌ RLS NO está habilitado'
    END as rls_status
FROM pg_class 
WHERE relname = 'comentarios_ejecutivo';

-- Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS:' as info,
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'comentarios_ejecutivo';

-- Verificar si la tabla solicitudes_operacion existe (referencia)
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'solicitudes_operacion') 
        THEN '✅ La tabla solicitudes_operacion EXISTE (referencia OK)'
        ELSE '❌ La tabla solicitudes_operacion NO EXISTE - PROBLEMA DE REFERENCIA'
    END as referencia_status;

-- ==================================================================
-- INSTRUCCIONES BASADAS EN LOS RESULTADOS:
-- ==================================================================
-- 
-- Si ves "❌ La columna solicitud_id NO EXISTE":
--    → Ejecuta: comentarios_ejecutivo_fix_complete.sql
--
-- Si ves "❌ La tabla comentarios_ejecutivo NO EXISTE":
--    → Ejecuta: comentarios_ejecutivo_setup.sql
--
-- Si ves "❌ La tabla solicitudes_operacion NO EXISTE":
--    → Necesitas crear esa tabla primero
--
-- Si todo está ✅, entonces el problema puede ser de cache.
-- Intenta refrescar la página o esperar unos minutos.
-- ==================================================================
