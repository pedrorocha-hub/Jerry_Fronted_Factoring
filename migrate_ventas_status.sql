-- ==================================================================
-- SCRIPT DE MIGRACIÓN PARA ACTUALIZAR STATUS DE VENTAS MENSUALES
-- ==================================================================
-- Este script actualiza los valores de status en la tabla ventas_mensuales
-- de los valores antiguos a los nuevos:
--   'Borrador'   -> 'borrador'
--   'Validado'   -> 'completado'
--   'Rechazado'  -> 'en_revision'
--   'En revision' -> 'en_revision'
--
-- NOTA: Los valores 'Validado' y 'Rechazado' se mapean a 'completado' y 'en_revision'
-- respectivamente según la nueva estructura de status solicitada.
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Revisa los resultados de la consulta de verificación
-- 5. Ejecuta el script de migración
-- 6. Verifica los resultados finales
-- ==================================================================

-- Paso 1: Verificar los valores actuales de status
SELECT 
    status,
    COUNT(*) as cantidad
FROM public.ventas_mensuales
GROUP BY status
ORDER BY cantidad DESC;

-- Paso 2: Actualizar los valores de status
UPDATE public.ventas_mensuales
SET status = CASE 
    WHEN status = 'Borrador' THEN 'borrador'
    WHEN status = 'Validado' THEN 'completado'
    WHEN status = 'Rechazado' THEN 'en_revision'
    WHEN status = 'En revision' THEN 'en_revision'
    WHEN status = 'En Revisión' THEN 'en_revision'
    WHEN status = 'Completado' THEN 'completado'
    -- Si ya está en el formato nuevo, mantenerlo
    WHEN status IN ('borrador', 'en_revision', 'completado') THEN status
    -- Default para cualquier otro valor
    ELSE 'borrador'
END
WHERE status IS NOT NULL;

-- Paso 3: Establecer 'borrador' como valor por defecto para registros con status NULL
UPDATE public.ventas_mensuales
SET status = 'borrador'
WHERE status IS NULL;

-- Paso 4: Verificar los resultados después de la migración
SELECT 
    status,
    COUNT(*) as cantidad
FROM public.ventas_mensuales
GROUP BY status
ORDER BY cantidad DESC;

-- Paso 5 (Opcional): Si existe un CHECK constraint, actualizarlo
-- Primero, eliminar el constraint antiguo si existe
ALTER TABLE public.ventas_mensuales 
DROP CONSTRAINT IF EXISTS ventas_mensuales_status_check;

-- Crear el nuevo constraint con los valores actualizados
ALTER TABLE public.ventas_mensuales 
ADD CONSTRAINT ventas_mensuales_status_check 
CHECK (status IN ('borrador', 'en_revision', 'completado'));

-- Paso 6: Verificación final - Mostrar algunos registros actualizados
SELECT 
    id,
    proveedor_ruc,
    anio,
    status,
    validado_por,
    updated_at
FROM public.ventas_mensuales
ORDER BY updated_at DESC
LIMIT 10;
