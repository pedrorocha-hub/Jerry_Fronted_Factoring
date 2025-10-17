-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE COMENTARIOS DEL EJECUTIVO
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla comentarios_ejecutivo
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.comentarios_ejecutivo_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comentario_ejecutivo_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_audit_log_comentario_id 
    ON public.comentarios_ejecutivo_audit_log(comentario_ejecutivo_id);

CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_audit_log_created_at 
    ON public.comentarios_ejecutivo_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_audit_log_user_id 
    ON public.comentarios_ejecutivo_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.comentarios_ejecutivo_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view comentarios ejecutivo audit logs" ON public.comentarios_ejecutivo_audit_log;
DROP POLICY IF EXISTS "System can insert comentarios ejecutivo audit logs" ON public.comentarios_ejecutivo_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view comentarios ejecutivo audit logs" 
    ON public.comentarios_ejecutivo_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert comentarios ejecutivo audit logs" 
    ON public.comentarios_ejecutivo_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear función de trigger para auditoría
CREATE OR REPLACE FUNCTION public.comentarios_ejecutivo_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    audit_record RECORD;
    changed_fields JSONB := '{}';
    old_values JSONB := '{}';
    new_values JSONB := '{}';
    field_name TEXT;
    old_value TEXT;
    new_value TEXT;
BEGIN
    -- Determinar la acción
    IF TG_OP = 'INSERT' THEN
        audit_record.action := 'created';
    ELSIF TG_OP = 'UPDATE' THEN
        audit_record.action := 'updated';
    ELSIF TG_OP = 'DELETE' THEN
        audit_record.action := 'deleted';
    END IF;

    -- Obtener información del usuario actual
    audit_record.user_id := auth.uid();
    audit_record.user_email := auth.jwt() ->> 'email';

    -- Para INSERT y UPDATE, usar NEW
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        audit_record.comentario_ejecutivo_id := NEW.id;
        
        -- Para UPDATE, comparar campos
        IF TG_OP = 'UPDATE' THEN
            -- Comentario
            IF OLD.comentario IS DISTINCT FROM NEW.comentario THEN
                changed_fields := changed_fields || jsonb_build_object('comentario', true);
                old_values := old_values || jsonb_build_object('comentario', OLD.comentario);
                new_values := new_values || jsonb_build_object('comentario', NEW.comentario);
            END IF;
            
            -- Archivos adjuntos
            IF OLD.archivos_adjuntos IS DISTINCT FROM NEW.archivos_adjuntos THEN
                changed_fields := changed_fields || jsonb_build_object('archivos_adjuntos', true);
                old_values := old_values || jsonb_build_object('archivos_adjuntos', OLD.archivos_adjuntos);
                new_values := new_values || jsonb_build_object('archivos_adjuntos', NEW.archivos_adjuntos);
            END IF;
            
            -- RIB ID
            IF OLD.rib_id IS DISTINCT FROM NEW.rib_id THEN
                changed_fields := changed_fields || jsonb_build_object('rib_id', true);
                old_values := old_values || jsonb_build_object('rib_id', OLD.rib_id);
                new_values := new_values || jsonb_build_object('rib_id', NEW.rib_id);
            END IF;
            
            -- Solicitud ID
            IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
                changed_fields := changed_fields || jsonb_build_object('solicitud_id', true);
                old_values := old_values || jsonb_build_object('solicitud_id', OLD.solicitud_id);
                new_values := new_values || jsonb_build_object('solicitud_id', NEW.solicitud_id);
            END IF;
        ELSE
            -- Para INSERT, registrar todos los valores
            new_values := jsonb_build_object(
                'comentario', NEW.comentario,
                'archivos_adjuntos', NEW.archivos_adjuntos,
                'rib_id', NEW.rib_id,
                'solicitud_id', NEW.solicitud_id
            );
        END IF;
    ELSE
        -- Para DELETE, usar OLD
        audit_record.comentario_ejecutivo_id := OLD.id;
        old_values := jsonb_build_object(
            'comentario', OLD.comentario,
            'archivos_adjuntos', OLD.archivos_adjuntos,
            'rib_id', OLD.rib_id,
            'solicitud_id', OLD.solicitud_id
        );
    END IF;

    -- Insertar el registro de auditoría
    INSERT INTO public.comentarios_ejecutivo_audit_log (
        comentario_ejecutivo_id,
        user_id,
        user_email,
        action,
        changed_fields,
        old_values,
        new_values
    ) VALUES (
        audit_record.comentario_ejecutivo_id,
        audit_record.user_id,
        audit_record.user_email,
        audit_record.action,
        CASE WHEN jsonb_object_keys(changed_fields) IS NOT NULL THEN changed_fields ELSE NULL END,
        CASE WHEN jsonb_object_keys(old_values) IS NOT NULL THEN old_values ELSE NULL END,
        CASE WHEN jsonb_object_keys(new_values) IS NOT NULL THEN new_values ELSE NULL END
    );

    -- Retornar el registro apropiado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Paso 6: Crear triggers
-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS comentarios_ejecutivo_audit_insert ON public.comentarios_ejecutivo;
DROP TRIGGER IF EXISTS comentarios_ejecutivo_audit_update ON public.comentarios_ejecutivo;
DROP TRIGGER IF EXISTS comentarios_ejecutivo_audit_delete ON public.comentarios_ejecutivo;

-- Crear triggers
CREATE TRIGGER comentarios_ejecutivo_audit_insert
    AFTER INSERT ON public.comentarios_ejecutivo
    FOR EACH ROW
    EXECUTE FUNCTION public.comentarios_ejecutivo_audit_trigger();

CREATE TRIGGER comentarios_ejecutivo_audit_update
    AFTER UPDATE ON public.comentarios_ejecutivo
    FOR EACH ROW
    EXECUTE FUNCTION public.comentarios_ejecutivo_audit_trigger();

CREATE TRIGGER comentarios_ejecutivo_audit_delete
    AFTER DELETE ON public.comentarios_ejecutivo
    FOR EACH ROW
    EXECUTE FUNCTION public.comentarios_ejecutivo_audit_trigger();

-- Paso 7: Comentarios sobre la tabla
COMMENT ON TABLE public.comentarios_ejecutivo_audit_log IS 'Tabla de auditoría para comentarios del ejecutivo';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.comentario_ejecutivo_id IS 'ID del comentario del ejecutivo auditado';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.user_id IS 'ID del usuario que realizó la acción';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.user_email IS 'Email del usuario que realizó la acción';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.action IS 'Tipo de acción realizada (created, updated, deleted)';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.changed_fields IS 'Campos que fueron modificados (solo para updates)';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.old_values IS 'Valores anteriores (para updates y deletes)';
COMMENT ON COLUMN public.comentarios_ejecutivo_audit_log.new_values IS 'Valores nuevos (para creates y updates)';

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- Verificar que todo se creó correctamente:
-- SELECT * FROM public.comentarios_ejecutivo_audit_log LIMIT 5;
-- ==================================================================
