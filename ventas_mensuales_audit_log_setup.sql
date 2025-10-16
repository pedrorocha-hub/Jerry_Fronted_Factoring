-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE VENTAS MENSUALES
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla ventas_mensuales
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.ventas_mensuales_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ventas_mensuales_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_mensuales_audit_log_ventas_id 
    ON public.ventas_mensuales_audit_log(ventas_mensuales_id);

CREATE INDEX IF NOT EXISTS idx_ventas_mensuales_audit_log_created_at 
    ON public.ventas_mensuales_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ventas_mensuales_audit_log_user_id 
    ON public.ventas_mensuales_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.ventas_mensuales_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view ventas audit logs" ON public.ventas_mensuales_audit_log;
DROP POLICY IF EXISTS "System can insert ventas audit logs" ON public.ventas_mensuales_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view ventas audit logs" 
    ON public.ventas_mensuales_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert ventas audit logs" 
    ON public.ventas_mensuales_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.ventas_mensuales_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    -- SOLO los campos de negocio que queremos monitorear
    v_monitored_fields TEXT[] := ARRAY[
        'status',
        'validado_por',
        'solicitud_id',
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'setiembre',
        'octubre',
        'noviembre',
        'diciembre'
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
            IF (
                CASE v_field
                    WHEN 'status' THEN OLD.status IS DISTINCT FROM NEW.status
                    WHEN 'validado_por' THEN OLD.validado_por IS DISTINCT FROM NEW.validado_por
                    WHEN 'solicitud_id' THEN OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id
                    WHEN 'enero' THEN OLD.enero IS DISTINCT FROM NEW.enero
                    WHEN 'febrero' THEN OLD.febrero IS DISTINCT FROM NEW.febrero
                    WHEN 'marzo' THEN OLD.marzo IS DISTINCT FROM NEW.marzo
                    WHEN 'abril' THEN OLD.abril IS DISTINCT FROM NEW.abril
                    WHEN 'mayo' THEN OLD.mayo IS DISTINCT FROM NEW.mayo
                    WHEN 'junio' THEN OLD.junio IS DISTINCT FROM NEW.junio
                    WHEN 'julio' THEN OLD.julio IS DISTINCT FROM NEW.julio
                    WHEN 'agosto' THEN OLD.agosto IS DISTINCT FROM NEW.agosto
                    WHEN 'setiembre' THEN OLD.setiembre IS DISTINCT FROM NEW.setiembre
                    WHEN 'octubre' THEN OLD.octubre IS DISTINCT FROM NEW.octubre
                    WHEN 'noviembre' THEN OLD.noviembre IS DISTINCT FROM NEW.noviembre
                    WHEN 'diciembre' THEN OLD.diciembre IS DISTINCT FROM NEW.diciembre
                    ELSE FALSE
                END
            ) THEN
                -- Marcar el campo como cambiado
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                
                -- Guardar valor anterior y nuevo (siempre incluir el año para referencia)
                v_old_values := v_old_values || jsonb_build_object('anio', to_jsonb(OLD.anio));
                v_old_values := v_old_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'status' THEN to_jsonb(OLD.status)
                        WHEN 'validado_por' THEN to_jsonb(OLD.validado_por)
                        WHEN 'solicitud_id' THEN to_jsonb(OLD.solicitud_id)
                        WHEN 'enero' THEN to_jsonb(OLD.enero)
                        WHEN 'febrero' THEN to_jsonb(OLD.febrero)
                        WHEN 'marzo' THEN to_jsonb(OLD.marzo)
                        WHEN 'abril' THEN to_jsonb(OLD.abril)
                        WHEN 'mayo' THEN to_jsonb(OLD.mayo)
                        WHEN 'junio' THEN to_jsonb(OLD.junio)
                        WHEN 'julio' THEN to_jsonb(OLD.julio)
                        WHEN 'agosto' THEN to_jsonb(OLD.agosto)
                        WHEN 'setiembre' THEN to_jsonb(OLD.setiembre)
                        WHEN 'octubre' THEN to_jsonb(OLD.octubre)
                        WHEN 'noviembre' THEN to_jsonb(OLD.noviembre)
                        WHEN 'diciembre' THEN to_jsonb(OLD.diciembre)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object('anio', to_jsonb(NEW.anio));
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'status' THEN to_jsonb(NEW.status)
                        WHEN 'validado_por' THEN to_jsonb(NEW.validado_por)
                        WHEN 'solicitud_id' THEN to_jsonb(NEW.solicitud_id)
                        WHEN 'enero' THEN to_jsonb(NEW.enero)
                        WHEN 'febrero' THEN to_jsonb(NEW.febrero)
                        WHEN 'marzo' THEN to_jsonb(NEW.marzo)
                        WHEN 'abril' THEN to_jsonb(NEW.abril)
                        WHEN 'mayo' THEN to_jsonb(NEW.mayo)
                        WHEN 'junio' THEN to_jsonb(NEW.junio)
                        WHEN 'julio' THEN to_jsonb(NEW.julio)
                        WHEN 'agosto' THEN to_jsonb(NEW.agosto)
                        WHEN 'setiembre' THEN to_jsonb(NEW.setiembre)
                        WHEN 'octubre' THEN to_jsonb(NEW.octubre)
                        WHEN 'noviembre' THEN to_jsonb(NEW.noviembre)
                        WHEN 'diciembre' THEN to_jsonb(NEW.diciembre)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.ventas_mensuales_audit_log (
                ventas_mensuales_id,
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

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear los triggers en la tabla ventas_mensuales
DROP TRIGGER IF EXISTS ventas_mensuales_audit_insert ON public.ventas_mensuales;
CREATE TRIGGER ventas_mensuales_audit_insert
    AFTER INSERT ON public.ventas_mensuales
    FOR EACH ROW
    EXECUTE FUNCTION public.ventas_mensuales_audit_trigger();

DROP TRIGGER IF EXISTS ventas_mensuales_audit_update ON public.ventas_mensuales;
CREATE TRIGGER ventas_mensuales_audit_update
    AFTER UPDATE ON public.ventas_mensuales
    FOR EACH ROW
    EXECUTE FUNCTION public.ventas_mensuales_audit_trigger();

DROP TRIGGER IF EXISTS ventas_mensuales_audit_delete ON public.ventas_mensuales;
CREATE TRIGGER ventas_mensuales_audit_delete
    AFTER DELETE ON public.ventas_mensuales
    FOR EACH ROW
    EXECUTE FUNCTION public.ventas_mensuales_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'ventas_mensuales_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'ventas_mensuales_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'ventas_mensuales_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================
