-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE FICHA RUC
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla ficha_ruc
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.ficha_ruc_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ficha_ruc_id INTEGER NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ficha_ruc_audit_log_ficha_ruc_id 
    ON public.ficha_ruc_audit_log(ficha_ruc_id);

CREATE INDEX IF NOT EXISTS idx_ficha_ruc_audit_log_created_at 
    ON public.ficha_ruc_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ficha_ruc_audit_log_user_id 
    ON public.ficha_ruc_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.ficha_ruc_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view ficha ruc audit logs" ON public.ficha_ruc_audit_log;
DROP POLICY IF EXISTS "System can insert ficha ruc audit logs" ON public.ficha_ruc_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view ficha ruc audit logs" 
    ON public.ficha_ruc_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert ficha ruc audit logs" 
    ON public.ficha_ruc_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.ficha_ruc_audit_trigger()
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
        'nombre_empresa',
        'ruc',
        'actividad_empresa',
        'fecha_inicio_actividades',
        'estado_contribuyente',
        'domicilio_fiscal',
        'nombre_representante_legal'
    ];
BEGIN
    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    v_user_email := auth.email();

    -- Determinar el tipo de acción
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        INSERT INTO public.ficha_ruc_audit_log (
            ficha_ruc_id,
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
            NULL,
            NULL,
            NULL
        );

    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';

        -- Comparar SOLO los campos que queremos monitorear
        FOREACH v_field IN ARRAY v_monitored_fields LOOP
            IF (
                CASE v_field
                    WHEN 'nombre_empresa' THEN OLD.nombre_empresa IS DISTINCT FROM NEW.nombre_empresa
                    WHEN 'ruc' THEN OLD.ruc IS DISTINCT FROM NEW.ruc
                    WHEN 'actividad_empresa' THEN OLD.actividad_empresa IS DISTINCT FROM NEW.actividad_empresa
                    WHEN 'fecha_inicio_actividades' THEN OLD.fecha_inicio_actividades IS DISTINCT FROM NEW.fecha_inicio_actividades
                    WHEN 'estado_contribuyente' THEN OLD.estado_contribuyente IS DISTINCT FROM NEW.estado_contribuyente
                    WHEN 'domicilio_fiscal' THEN OLD.domicilio_fiscal IS DISTINCT FROM NEW.domicilio_fiscal
                    WHEN 'nombre_representante_legal' THEN OLD.nombre_representante_legal IS DISTINCT FROM NEW.nombre_representante_legal
                    ELSE FALSE
                END
            ) THEN
                -- Marcar el campo como cambiado
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                
                -- Guardar valor anterior y nuevo
                v_old_values := v_old_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'nombre_empresa' THEN to_jsonb(OLD.nombre_empresa)
                        WHEN 'ruc' THEN to_jsonb(OLD.ruc)
                        WHEN 'actividad_empresa' THEN to_jsonb(OLD.actividad_empresa)
                        WHEN 'fecha_inicio_actividades' THEN to_jsonb(OLD.fecha_inicio_actividades)
                        WHEN 'estado_contribuyente' THEN to_jsonb(OLD.estado_contribuyente)
                        WHEN 'domicilio_fiscal' THEN to_jsonb(OLD.domicilio_fiscal)
                        WHEN 'nombre_representante_legal' THEN to_jsonb(OLD.nombre_representante_legal)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'nombre_empresa' THEN to_jsonb(NEW.nombre_empresa)
                        WHEN 'ruc' THEN to_jsonb(NEW.ruc)
                        WHEN 'actividad_empresa' THEN to_jsonb(NEW.actividad_empresa)
                        WHEN 'fecha_inicio_actividades' THEN to_jsonb(NEW.fecha_inicio_actividades)
                        WHEN 'estado_contribuyente' THEN to_jsonb(NEW.estado_contribuyente)
                        WHEN 'domicilio_fiscal' THEN to_jsonb(NEW.domicilio_fiscal)
                        WHEN 'nombre_representante_legal' THEN to_jsonb(NEW.nombre_representante_legal)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.ficha_ruc_audit_log (
                ficha_ruc_id,
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
        v_action := 'deleted';
        INSERT INTO public.ficha_ruc_audit_log (
            ficha_ruc_id,
            user_id,
            user_email,
            action,
            changed_fields,
            old_values,
            new_values
        ) VALUES (
            OLD.id,
            v_user_id,
            v_user_email,
            v_action,
            NULL,
            NULL,
            NULL
        );
    END IF;

    RETURN NULL; -- Para triggers AFTER, el valor de retorno se ignora
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear los triggers en la tabla ficha_ruc
DROP TRIGGER IF EXISTS ficha_ruc_audit_insert ON public.ficha_ruc;
CREATE TRIGGER ficha_ruc_audit_insert
    AFTER INSERT ON public.ficha_ruc
    FOR EACH ROW
    EXECUTE FUNCTION public.ficha_ruc_audit_trigger();

DROP TRIGGER IF EXISTS ficha_ruc_audit_update ON public.ficha_ruc;
CREATE TRIGGER ficha_ruc_audit_update
    AFTER UPDATE ON public.ficha_ruc
    FOR EACH ROW
    EXECUTE FUNCTION public.ficha_ruc_audit_trigger();

DROP TRIGGER IF EXISTS ficha_ruc_audit_delete ON public.ficha_ruc;
CREATE TRIGGER ficha_ruc_audit_delete
    AFTER DELETE ON public.ficha_ruc
    FOR EACH ROW
    EXECUTE FUNCTION public.ficha_ruc_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'ficha_ruc_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'ficha_ruc_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'ficha_ruc_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================
