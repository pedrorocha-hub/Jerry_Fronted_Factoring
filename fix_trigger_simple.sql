-- ==========================================
-- FUNCIÓN TRIGGER SIMPLIFICADA PARA DEBUG
-- ==========================================
-- Esta versión simplificada nos ayudará a identificar el problema

CREATE OR REPLACE FUNCTION public.ventas_mensuales_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
BEGIN
    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    v_user_email := COALESCE(auth.email(), 'sistema@test.com');

    -- Solo procesar UPDATEs
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSIF TG_OP <> 'UPDATE' THEN
        RETURN NEW;
    END IF;

    -- Determinar acción
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_action := 'status_changed';
    ELSE
        v_action := 'updated';
    END IF;

    -- Detectar cambios en enero (para probar)
    IF OLD.enero IS DISTINCT FROM NEW.enero THEN
        v_changed_fields := jsonb_build_object('enero', true);
        v_old_values := jsonb_build_object(
            'anio', OLD.anio,
            'enero', OLD.enero
        );
        v_new_values := jsonb_build_object(
            'anio', NEW.anio,
            'enero', NEW.enero
        );
    END IF;

    -- Detectar cambios en status
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('status', true);
        v_old_values := v_old_values || jsonb_build_object(
            'anio', OLD.anio,
            'status', OLD.status
        );
        v_new_values := v_new_values || jsonb_build_object(
            'anio', NEW.anio,
            'status', NEW.status
        );
    END IF;

    -- Si hay cambios, insertar log
    IF v_changed_fields <> '{}'::JSONB THEN
        BEGIN
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
            
            RAISE NOTICE '✅ Log insertado correctamente para ventas_mensuales_id: %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '❌ Error al insertar log: % - %', SQLERRM, SQLSTATE;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ahora prueba de nuevo el UPDATE
SELECT 'Función actualizada. Ahora ejecuta de nuevo el UPDATE:' as mensaje;

/*
UPDATE ventas_mensuales 
SET enero = COALESCE(enero, 0) + 1
WHERE id = '50aec204-4441-4985-a6e1-2b5c67f5cda1';
*/

-- Luego verifica:
SELECT * FROM ventas_mensuales_audit_log ORDER BY created_at DESC LIMIT 5;
