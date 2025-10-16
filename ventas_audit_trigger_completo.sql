-- ==========================================
-- FUNCIÓN TRIGGER COMPLETA PARA AUDIT LOG
-- Detecta cambios en TODOS los meses y campos
-- ==========================================

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

    -- Inicializar con el año (siempre lo incluimos para referencia)
    v_old_values := jsonb_build_object('anio', OLD.anio);
    v_new_values := jsonb_build_object('anio', NEW.anio);

    -- Detectar cambios en cada campo
    -- Status
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('status', true);
        v_old_values := v_old_values || jsonb_build_object('status', OLD.status);
        v_new_values := v_new_values || jsonb_build_object('status', NEW.status);
    END IF;

    -- Validado Por
    IF OLD.validado_por IS DISTINCT FROM NEW.validado_por THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('validado_por', true);
        v_old_values := v_old_values || jsonb_build_object('validado_por', OLD.validado_por);
        v_new_values := v_new_values || jsonb_build_object('validado_por', NEW.validado_por);
    END IF;

    -- Solicitud ID
    IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('solicitud_id', true);
        v_old_values := v_old_values || jsonb_build_object('solicitud_id', OLD.solicitud_id);
        v_new_values := v_new_values || jsonb_build_object('solicitud_id', NEW.solicitud_id);
    END IF;

    -- Enero
    IF OLD.enero IS DISTINCT FROM NEW.enero THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('enero', true);
        v_old_values := v_old_values || jsonb_build_object('enero', OLD.enero);
        v_new_values := v_new_values || jsonb_build_object('enero', NEW.enero);
    END IF;

    -- Febrero
    IF OLD.febrero IS DISTINCT FROM NEW.febrero THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('febrero', true);
        v_old_values := v_old_values || jsonb_build_object('febrero', OLD.febrero);
        v_new_values := v_new_values || jsonb_build_object('febrero', NEW.febrero);
    END IF;

    -- Marzo
    IF OLD.marzo IS DISTINCT FROM NEW.marzo THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('marzo', true);
        v_old_values := v_old_values || jsonb_build_object('marzo', OLD.marzo);
        v_new_values := v_new_values || jsonb_build_object('marzo', NEW.marzo);
    END IF;

    -- Abril
    IF OLD.abril IS DISTINCT FROM NEW.abril THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('abril', true);
        v_old_values := v_old_values || jsonb_build_object('abril', OLD.abril);
        v_new_values := v_new_values || jsonb_build_object('abril', NEW.abril);
    END IF;

    -- Mayo
    IF OLD.mayo IS DISTINCT FROM NEW.mayo THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('mayo', true);
        v_old_values := v_old_values || jsonb_build_object('mayo', OLD.mayo);
        v_new_values := v_new_values || jsonb_build_object('mayo', NEW.mayo);
    END IF;

    -- Junio
    IF OLD.junio IS DISTINCT FROM NEW.junio THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('junio', true);
        v_old_values := v_old_values || jsonb_build_object('junio', OLD.junio);
        v_new_values := v_new_values || jsonb_build_object('junio', NEW.junio);
    END IF;

    -- Julio
    IF OLD.julio IS DISTINCT FROM NEW.julio THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('julio', true);
        v_old_values := v_old_values || jsonb_build_object('julio', OLD.julio);
        v_new_values := v_new_values || jsonb_build_object('julio', NEW.julio);
    END IF;

    -- Agosto
    IF OLD.agosto IS DISTINCT FROM NEW.agosto THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('agosto', true);
        v_old_values := v_old_values || jsonb_build_object('agosto', OLD.agosto);
        v_new_values := v_new_values || jsonb_build_object('agosto', NEW.agosto);
    END IF;

    -- Setiembre
    IF OLD.setiembre IS DISTINCT FROM NEW.setiembre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('setiembre', true);
        v_old_values := v_old_values || jsonb_build_object('setiembre', OLD.setiembre);
        v_new_values := v_new_values || jsonb_build_object('setiembre', NEW.setiembre);
    END IF;

    -- Octubre
    IF OLD.octubre IS DISTINCT FROM NEW.octubre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('octubre', true);
        v_old_values := v_old_values || jsonb_build_object('octubre', OLD.octubre);
        v_new_values := v_new_values || jsonb_build_object('octubre', NEW.octubre);
    END IF;

    -- Noviembre
    IF OLD.noviembre IS DISTINCT FROM NEW.noviembre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('noviembre', true);
        v_old_values := v_old_values || jsonb_build_object('noviembre', OLD.noviembre);
        v_new_values := v_new_values || jsonb_build_object('noviembre', NEW.noviembre);
    END IF;

    -- Diciembre
    IF OLD.diciembre IS DISTINCT FROM NEW.diciembre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('diciembre', true);
        v_old_values := v_old_values || jsonb_build_object('diciembre', OLD.diciembre);
        v_new_values := v_new_values || jsonb_build_object('diciembre', NEW.diciembre);
    END IF;

    -- Si hay cambios, insertar log (excluir 'anio' del check ya que siempre está)
    IF jsonb_object_keys(v_changed_fields) IS NOT NULL THEN
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
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error al insertar audit log: % - %', SQLERRM, SQLSTATE;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PRUEBA FINAL
-- ==========================================

SELECT 'Función completa actualizada. Realiza una prueba:' as mensaje;

-- Prueba 1: Cambiar un mes
-- UPDATE ventas_mensuales SET febrero = COALESCE(febrero, 0) + 1 WHERE id = '50aec204-4441-4985-a6e1-2b5c67f5cda1';

-- Prueba 2: Cambiar el status
-- UPDATE ventas_mensuales SET status = 'Validado' WHERE id = '50aec204-4441-4985-a6e1-2b5c67f5cda1';

-- Ver los logs
-- SELECT * FROM ventas_mensuales_audit_log ORDER BY created_at DESC LIMIT 10;
