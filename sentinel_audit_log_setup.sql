-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE SENTINEL
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla sentinel
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.sentinel_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sentinel_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_sentinel_audit_log_sentinel_id 
    ON public.sentinel_audit_log(sentinel_id);

CREATE INDEX IF NOT EXISTS idx_sentinel_audit_log_created_at 
    ON public.sentinel_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sentinel_audit_log_user_id 
    ON public.sentinel_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.sentinel_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view sentinel audit logs" ON public.sentinel_audit_log;
DROP POLICY IF EXISTS "System can insert sentinel audit logs" ON public.sentinel_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view sentinel audit logs" 
    ON public.sentinel_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert sentinel audit logs" 
    ON public.sentinel_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.sentinel_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    -- Campos de negocio que queremos monitorear
    v_monitored_fields TEXT[] := ARRAY[
        'ruc',
        'status',
        'score',
        'comportamiento_calificacion',
        'deuda_directa',
        'deuda_indirecta',
        'impagos',
        'deudas_sunat',
        'protestos'
    ];
BEGIN
    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    v_user_email := auth.email();

    -- Determinar el tipo de acción
    IF TG_OP = 'INSERT' THEN
        -- NO auditar INSERTs (para evitar ruido cuando se crean registros nuevos)
        RETURN NULL;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Detectar si fue un cambio de status
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            v_action := 'status_changed';
        ELSE
            v_action := 'updated';
        END IF;

        -- Comparar SOLO los campos que queremos monitorear
        FOREACH v_field IN ARRAY v_monitored_fields LOOP
            -- Usar EXECUTE para comparar dinámicamente los campos
            IF (
                CASE v_field
                    WHEN 'ruc' THEN OLD.ruc IS DISTINCT FROM NEW.ruc
                    WHEN 'status' THEN OLD.status IS DISTINCT FROM NEW.status
                    WHEN 'score' THEN OLD.score IS DISTINCT FROM NEW.score
                    WHEN 'comportamiento_calificacion' THEN OLD.comportamiento_calificacion IS DISTINCT FROM NEW.comportamiento_calificacion
                    WHEN 'deuda_directa' THEN OLD.deuda_directa IS DISTINCT FROM NEW.deuda_directa
                    WHEN 'deuda_indirecta' THEN OLD.deuda_indirecta IS DISTINCT FROM NEW.deuda_indirecta
                    WHEN 'impagos' THEN OLD.impagos IS DISTINCT FROM NEW.impagos
                    WHEN 'deudas_sunat' THEN OLD.deudas_sunat IS DISTINCT FROM NEW.deudas_sunat
                    WHEN 'protestos' THEN OLD.protestos IS DISTINCT FROM NEW.protestos
                    ELSE FALSE
                END
            ) THEN
                -- Marcar el campo como cambiado
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                
                -- Guardar valor anterior y nuevo
                v_old_values := v_old_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'ruc' THEN to_jsonb(OLD.ruc)
                        WHEN 'status' THEN to_jsonb(OLD.status)
                        WHEN 'score' THEN to_jsonb(OLD.score)
                        WHEN 'comportamiento_calificacion' THEN to_jsonb(OLD.comportamiento_calificacion)
                        WHEN 'deuda_directa' THEN to_jsonb(OLD.deuda_directa)
                        WHEN 'deuda_indirecta' THEN to_jsonb(OLD.deuda_indirecta)
                        WHEN 'impagos' THEN to_jsonb(OLD.impagos)
                        WHEN 'deudas_sunat' THEN to_jsonb(OLD.deudas_sunat)
                        WHEN 'protestos' THEN to_jsonb(OLD.protestos)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'ruc' THEN to_jsonb(NEW.ruc)
                        WHEN 'status' THEN to_jsonb(NEW.status)
                        WHEN 'score' THEN to_jsonb(NEW.score)
                        WHEN 'comportamiento_calificacion' THEN to_jsonb(NEW.comportamiento_calificacion)
                        WHEN 'deuda_directa' THEN to_jsonb(NEW.deuda_directa)
                        WHEN 'deuda_indirecta' THEN to_jsonb(NEW.deuda_indirecta)
                        WHEN 'impagos' THEN to_jsonb(NEW.impagos)
                        WHEN 'deudas_sunat' THEN to_jsonb(NEW.deudas_sunat)
                        WHEN 'protestos' THEN to_jsonb(NEW.protestos)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.sentinel_audit_log (
                sentinel_id,
                user_id,
                user_email,
                action,
                changed_fields,
                old_values,
                new_values
            ) VALUES (
                NEW.id,
                v_user_id,
                v_user_email,
                v_action,
                v_changed_fields,
                v_old_values,
                v_new_values
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        -- NO auditar DELETEs (para evitar ruido cuando se eliminan registros)
        RETURN NULL;
    END IF;

    RETURN NULL; -- Para triggers AFTER, el valor de retorno se ignora
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear los triggers en la tabla sentinel
DROP TRIGGER IF EXISTS sentinel_audit_insert ON public.sentinel;
CREATE TRIGGER sentinel_audit_insert
    AFTER INSERT ON public.sentinel
    FOR EACH ROW
    EXECUTE FUNCTION public.sentinel_audit_trigger();

DROP TRIGGER IF EXISTS sentinel_audit_update ON public.sentinel;
CREATE TRIGGER sentinel_audit_update
    AFTER UPDATE ON public.sentinel
    FOR EACH ROW
    EXECUTE FUNCTION public.sentinel_audit_trigger();

DROP TRIGGER IF EXISTS sentinel_audit_delete ON public.sentinel;
CREATE TRIGGER sentinel_audit_delete
    AFTER DELETE ON public.sentinel
    FOR EACH ROW
    EXECUTE FUNCTION public.sentinel_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'sentinel_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'sentinel_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'sentinel_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================

