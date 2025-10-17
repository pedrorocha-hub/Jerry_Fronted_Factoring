-- ==================================================================
-- SCRIPT PARA CORREGIR EL TRIGGER DE AUDITORÍA DE COMENTARIOS EJECUTIVO
-- ==================================================================
-- Este script corrige el error "record audit_record is not assigned yet"
-- y elimina referencias a rib_id que ya no existe
-- ==================================================================

-- Eliminar la función existente
DROP FUNCTION IF EXISTS public.comentarios_ejecutivo_audit_trigger() CASCADE;

-- Crear la función corregida del trigger
CREATE OR REPLACE FUNCTION public.comentarios_ejecutivo_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_comentario_ejecutivo_id UUID;
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}';
    v_old_values JSONB := '{}';
    v_new_values JSONB := '{}';
BEGIN
    -- Determinar la acción
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'deleted';
    END IF;

    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    v_user_email := auth.jwt() ->> 'email';

    -- Para INSERT y UPDATE, usar NEW
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_comentario_ejecutivo_id := NEW.id;
        
        -- Para UPDATE, comparar campos
        IF TG_OP = 'UPDATE' THEN
            -- Comentario
            IF OLD.comentario IS DISTINCT FROM NEW.comentario THEN
                v_changed_fields := v_changed_fields || jsonb_build_object('comentario', true);
                v_old_values := v_old_values || jsonb_build_object('comentario', OLD.comentario);
                v_new_values := v_new_values || jsonb_build_object('comentario', NEW.comentario);
            END IF;
            
            -- Archivos adjuntos
            IF OLD.archivos_adjuntos IS DISTINCT FROM NEW.archivos_adjuntos THEN
                v_changed_fields := v_changed_fields || jsonb_build_object('archivos_adjuntos', true);
                v_old_values := v_old_values || jsonb_build_object('archivos_adjuntos', OLD.archivos_adjuntos);
                v_new_values := v_new_values || jsonb_build_object('archivos_adjuntos', NEW.archivos_adjuntos);
            END IF;
            
            -- Solicitud ID
            IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
                v_changed_fields := v_changed_fields || jsonb_build_object('solicitud_id', true);
                v_old_values := v_old_values || jsonb_build_object('solicitud_id', OLD.solicitud_id);
                v_new_values := v_new_values || jsonb_build_object('solicitud_id', NEW.solicitud_id);
            END IF;
        ELSE
            -- Para INSERT, registrar todos los valores
            v_new_values := jsonb_build_object(
                'comentario', NEW.comentario,
                'archivos_adjuntos', NEW.archivos_adjuntos,
                'solicitud_id', NEW.solicitud_id
            );
        END IF;
    ELSE
        -- Para DELETE, usar OLD
        v_comentario_ejecutivo_id := OLD.id;
        v_old_values := jsonb_build_object(
            'comentario', OLD.comentario,
            'archivos_adjuntos', OLD.archivos_adjuntos,
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
        v_comentario_ejecutivo_id,
        v_user_id,
        v_user_email,
        v_action,
        NULLIF(v_changed_fields, '{}'::jsonb),
        NULLIF(v_old_values, '{}'::jsonb),
        NULLIF(v_new_values, '{}'::jsonb)
    );

    -- Retornar el registro apropiado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear los triggers
DROP TRIGGER IF EXISTS comentarios_ejecutivo_audit_insert ON public.comentarios_ejecutivo;
DROP TRIGGER IF EXISTS comentarios_ejecutivo_audit_update ON public.comentarios_ejecutivo;
DROP TRIGGER IF EXISTS comentarios_ejecutivo_audit_delete ON public.comentarios_ejecutivo;

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

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- Para verificar que el trigger funciona correctamente, puedes ejecutar:
-- 
-- INSERT INTO comentarios_ejecutivo (comentario, archivos_adjuntos, solicitud_id)
-- VALUES ('Test comentario', '{}', 'algún-uuid-válido');
-- 
-- Luego verifica el audit log:
-- SELECT * FROM comentarios_ejecutivo_audit_log ORDER BY created_at DESC LIMIT 1;
-- ==================================================================

