-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE ACCIONISTAS Y GERENCIA
-- ==================================================================
-- Este script crea las tablas de audit log para accionistas y gerencia
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- ========================================
-- PARTE 1: AUDIT LOG PARA ACCIONISTAS
-- ========================================

-- Crear tabla de audit log para accionistas
CREATE TABLE IF NOT EXISTS public.accionista_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    accionista_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_accionista_audit_log_accionista_id 
    ON public.accionista_audit_log(accionista_id);

CREATE INDEX IF NOT EXISTS idx_accionista_audit_log_created_at 
    ON public.accionista_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_accionista_audit_log_user_id 
    ON public.accionista_audit_log(user_id);

-- Habilitar RLS
ALTER TABLE public.accionista_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "Users can view accionista audit logs" ON public.accionista_audit_log;
DROP POLICY IF EXISTS "System can insert accionista audit logs" ON public.accionista_audit_log;

CREATE POLICY "Users can view accionista audit logs" 
    ON public.accionista_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can insert accionista audit logs" 
    ON public.accionista_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Función trigger para accionistas
CREATE OR REPLACE FUNCTION public.accionista_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    v_monitored_fields TEXT[] := ARRAY['dni', 'nombre', 'porcentaje', 'vinculo', 'calificacion', 'comentario'];
BEGIN
    v_user_id := auth.uid();
    v_user_email := auth.email();

    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        INSERT INTO public.accionista_audit_log (
            accionista_id, user_id, user_email, action, changed_fields, old_values, new_values
        ) VALUES (
            NEW.id, v_user_id, v_user_email, v_action, NULL, NULL, 
            jsonb_build_object('ruc', NEW.ruc, 'nombre', NEW.nombre, 'dni', NEW.dni)
        );

    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';
        
        FOREACH v_field IN ARRAY v_monitored_fields LOOP
            IF (
                CASE v_field
                    WHEN 'dni' THEN OLD.dni IS DISTINCT FROM NEW.dni
                    WHEN 'nombre' THEN OLD.nombre IS DISTINCT FROM NEW.nombre
                    WHEN 'porcentaje' THEN OLD.porcentaje IS DISTINCT FROM NEW.porcentaje
                    WHEN 'vinculo' THEN OLD.vinculo IS DISTINCT FROM NEW.vinculo
                    WHEN 'calificacion' THEN OLD.calificacion IS DISTINCT FROM NEW.calificacion
                    WHEN 'comentario' THEN OLD.comentario IS DISTINCT FROM NEW.comentario
                    ELSE FALSE
                END
            ) THEN
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                v_old_values := v_old_values || jsonb_build_object('ruc', OLD.ruc);
                v_old_values := v_old_values || jsonb_build_object(v_field,
                    CASE v_field
                        WHEN 'dni' THEN to_jsonb(OLD.dni)
                        WHEN 'nombre' THEN to_jsonb(OLD.nombre)
                        WHEN 'porcentaje' THEN to_jsonb(OLD.porcentaje)
                        WHEN 'vinculo' THEN to_jsonb(OLD.vinculo)
                        WHEN 'calificacion' THEN to_jsonb(OLD.calificacion)
                        WHEN 'comentario' THEN to_jsonb(OLD.comentario)
                    END
                );
                v_new_values := v_new_values || jsonb_build_object('ruc', NEW.ruc);
                v_new_values := v_new_values || jsonb_build_object(v_field,
                    CASE v_field
                        WHEN 'dni' THEN to_jsonb(NEW.dni)
                        WHEN 'nombre' THEN to_jsonb(NEW.nombre)
                        WHEN 'porcentaje' THEN to_jsonb(NEW.porcentaje)
                        WHEN 'vinculo' THEN to_jsonb(NEW.vinculo)
                        WHEN 'calificacion' THEN to_jsonb(NEW.calificacion)
                        WHEN 'comentario' THEN to_jsonb(NEW.comentario)
                    END
                );
            END IF;
        END LOOP;

        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.accionista_audit_log (
                accionista_id, user_id, user_email, action, changed_fields, old_values, new_values
            ) VALUES (
                NEW.id, v_user_id, v_user_email, v_action, v_changed_fields, v_old_values, v_new_values
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'deleted';
        INSERT INTO public.accionista_audit_log (
            accionista_id, user_id, user_email, action, changed_fields, old_values, new_values
        ) VALUES (
            OLD.id, v_user_id, v_user_email, v_action, NULL,
            jsonb_build_object('ruc', OLD.ruc, 'nombre', OLD.nombre, 'dni', OLD.dni), NULL
        );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers para accionistas
DROP TRIGGER IF EXISTS accionista_audit_insert ON public.ficha_ruc_accionistas;
CREATE TRIGGER accionista_audit_insert
    AFTER INSERT ON public.ficha_ruc_accionistas
    FOR EACH ROW
    EXECUTE FUNCTION public.accionista_audit_trigger();

DROP TRIGGER IF EXISTS accionista_audit_update ON public.ficha_ruc_accionistas;
CREATE TRIGGER accionista_audit_update
    AFTER UPDATE ON public.ficha_ruc_accionistas
    FOR EACH ROW
    EXECUTE FUNCTION public.accionista_audit_trigger();

DROP TRIGGER IF EXISTS accionista_audit_delete ON public.ficha_ruc_accionistas;
CREATE TRIGGER accionista_audit_delete
    AFTER DELETE ON public.ficha_ruc_accionistas
    FOR EACH ROW
    EXECUTE FUNCTION public.accionista_audit_trigger();

-- ========================================
-- PARTE 2: AUDIT LOG PARA GERENCIA
-- ========================================

-- Crear tabla de audit log para gerencia
CREATE TABLE IF NOT EXISTS public.gerencia_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gerente_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_gerencia_audit_log_gerente_id 
    ON public.gerencia_audit_log(gerente_id);

CREATE INDEX IF NOT EXISTS idx_gerencia_audit_log_created_at 
    ON public.gerencia_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gerencia_audit_log_user_id 
    ON public.gerencia_audit_log(user_id);

-- Habilitar RLS
ALTER TABLE public.gerencia_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "Users can view gerencia audit logs" ON public.gerencia_audit_log;
DROP POLICY IF EXISTS "System can insert gerencia audit logs" ON public.gerencia_audit_log;

CREATE POLICY "Users can view gerencia audit logs" 
    ON public.gerencia_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can insert gerencia audit logs" 
    ON public.gerencia_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Función trigger para gerencia
CREATE OR REPLACE FUNCTION public.gerencia_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    v_monitored_fields TEXT[] := ARRAY['dni', 'nombre', 'cargo', 'vinculo', 'calificacion', 'comentario'];
BEGIN
    v_user_id := auth.uid();
    v_user_email := auth.email();

    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        INSERT INTO public.gerencia_audit_log (
            gerente_id, user_id, user_email, action, changed_fields, old_values, new_values
        ) VALUES (
            NEW.id, v_user_id, v_user_email, v_action, NULL, NULL,
            jsonb_build_object('ruc', NEW.ruc, 'nombre', NEW.nombre, 'dni', NEW.dni, 'cargo', NEW.cargo)
        );

    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';
        
        FOREACH v_field IN ARRAY v_monitored_fields LOOP
            IF (
                CASE v_field
                    WHEN 'dni' THEN OLD.dni IS DISTINCT FROM NEW.dni
                    WHEN 'nombre' THEN OLD.nombre IS DISTINCT FROM NEW.nombre
                    WHEN 'cargo' THEN OLD.cargo IS DISTINCT FROM NEW.cargo
                    WHEN 'vinculo' THEN OLD.vinculo IS DISTINCT FROM NEW.vinculo
                    WHEN 'calificacion' THEN OLD.calificacion IS DISTINCT FROM NEW.calificacion
                    WHEN 'comentario' THEN OLD.comentario IS DISTINCT FROM NEW.comentario
                    ELSE FALSE
                END
            ) THEN
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                v_old_values := v_old_values || jsonb_build_object('ruc', OLD.ruc);
                v_old_values := v_old_values || jsonb_build_object(v_field,
                    CASE v_field
                        WHEN 'dni' THEN to_jsonb(OLD.dni)
                        WHEN 'nombre' THEN to_jsonb(OLD.nombre)
                        WHEN 'cargo' THEN to_jsonb(OLD.cargo)
                        WHEN 'vinculo' THEN to_jsonb(OLD.vinculo)
                        WHEN 'calificacion' THEN to_jsonb(OLD.calificacion)
                        WHEN 'comentario' THEN to_jsonb(OLD.comentario)
                    END
                );
                v_new_values := v_new_values || jsonb_build_object('ruc', NEW.ruc);
                v_new_values := v_new_values || jsonb_build_object(v_field,
                    CASE v_field
                        WHEN 'dni' THEN to_jsonb(NEW.dni)
                        WHEN 'nombre' THEN to_jsonb(NEW.nombre)
                        WHEN 'cargo' THEN to_jsonb(NEW.cargo)
                        WHEN 'vinculo' THEN to_jsonb(NEW.vinculo)
                        WHEN 'calificacion' THEN to_jsonb(NEW.calificacion)
                        WHEN 'comentario' THEN to_jsonb(NEW.comentario)
                    END
                );
            END IF;
        END LOOP;

        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.gerencia_audit_log (
                gerente_id, user_id, user_email, action, changed_fields, old_values, new_values
            ) VALUES (
                NEW.id, v_user_id, v_user_email, v_action, v_changed_fields, v_old_values, v_new_values
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'deleted';
        INSERT INTO public.gerencia_audit_log (
            gerente_id, user_id, user_email, action, changed_fields, old_values, new_values
        ) VALUES (
            OLD.id, v_user_id, v_user_email, v_action, NULL,
            jsonb_build_object('ruc', OLD.ruc, 'nombre', OLD.nombre, 'dni', OLD.dni, 'cargo', OLD.cargo), NULL
        );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers para gerencia
DROP TRIGGER IF EXISTS gerencia_audit_insert ON public.ficha_ruc_gerencia;
CREATE TRIGGER gerencia_audit_insert
    AFTER INSERT ON public.ficha_ruc_gerencia
    FOR EACH ROW
    EXECUTE FUNCTION public.gerencia_audit_trigger();

DROP TRIGGER IF EXISTS gerencia_audit_update ON public.ficha_ruc_gerencia;
CREATE TRIGGER gerencia_audit_update
    AFTER UPDATE ON public.ficha_ruc_gerencia
    FOR EACH ROW
    EXECUTE FUNCTION public.gerencia_audit_trigger();

DROP TRIGGER IF EXISTS gerencia_audit_delete ON public.ficha_ruc_gerencia;
CREATE TRIGGER gerencia_audit_delete
    AFTER DELETE ON public.ficha_ruc_gerencia
    FOR EACH ROW
    EXECUTE FUNCTION public.gerencia_audit_trigger();

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================
