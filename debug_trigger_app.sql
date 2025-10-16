-- ==========================================
-- DEBUG: Por qué no funciona desde la app
-- ==========================================

-- 1. Ver los logs que existen (deberías tener al menos el de la prueba manual)
SELECT 
    'Logs existentes:' as paso,
    COUNT(*) as total
FROM ventas_mensuales_audit_log;

SELECT * FROM ventas_mensuales_audit_log ORDER BY created_at DESC LIMIT 5;

-- 2. Verificar las políticas de RLS en audit_log
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'ventas_mensuales_audit_log';

-- 3. Modificar el trigger para que SIEMPRE inserte algo (sin importar errores)
CREATE OR REPLACE FUNCTION public.ventas_mensuales_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_error TEXT;
BEGIN
    -- Solo procesar UPDATEs
    IF TG_OP <> 'UPDATE' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    BEGIN
        -- Obtener información del usuario (con fallback)
        v_user_id := auth.uid();
        v_user_email := COALESCE(auth.email(), 'unknown@system.com');
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
        v_user_email := 'error-getting-auth@system.com';
    END;

    -- Determinar acción
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_action := 'status_changed';
    ELSE
        v_action := 'updated';
    END IF;

    -- Inicializar con el año
    v_old_values := jsonb_build_object('anio', OLD.anio);
    v_new_values := jsonb_build_object('anio', NEW.anio);

    -- Detectar cambios en TODOS los campos
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('status', true);
        v_old_values := v_old_values || jsonb_build_object('status', OLD.status);
        v_new_values := v_new_values || jsonb_build_object('status', NEW.status);
    END IF;

    IF OLD.validado_por IS DISTINCT FROM NEW.validado_por THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('validado_por', true);
        v_old_values := v_old_values || jsonb_build_object('validado_por', OLD.validado_por);
        v_new_values := v_new_values || jsonb_build_object('validado_por', NEW.validado_por);
    END IF;

    IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('solicitud_id', true);
        v_old_values := v_old_values || jsonb_build_object('solicitud_id', OLD.solicitud_id);
        v_new_values := v_new_values || jsonb_build_object('solicitud_id', NEW.solicitud_id);
    END IF;

    IF OLD.enero IS DISTINCT FROM NEW.enero THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('enero', true);
        v_old_values := v_old_values || jsonb_build_object('enero', OLD.enero);
        v_new_values := v_new_values || jsonb_build_object('enero', NEW.enero);
    END IF;

    IF OLD.febrero IS DISTINCT FROM NEW.febrero THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('febrero', true);
        v_old_values := v_old_values || jsonb_build_object('febrero', OLD.febrero);
        v_new_values := v_new_values || jsonb_build_object('febrero', NEW.febrero);
    END IF;

    IF OLD.marzo IS DISTINCT FROM NEW.marzo THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('marzo', true);
        v_old_values := v_old_values || jsonb_build_object('marzo', OLD.marzo);
        v_new_values := v_new_values || jsonb_build_object('marzo', NEW.marzo);
    END IF;

    IF OLD.abril IS DISTINCT FROM NEW.abril THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('abril', true);
        v_old_values := v_old_values || jsonb_build_object('abril', OLD.abril);
        v_new_values := v_new_values || jsonb_build_object('abril', NEW.abril);
    END IF;

    IF OLD.mayo IS DISTINCT FROM NEW.mayo THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('mayo', true);
        v_old_values := v_old_values || jsonb_build_object('mayo', OLD.mayo);
        v_new_values := v_new_values || jsonb_build_object('mayo', NEW.mayo);
    END IF;

    IF OLD.junio IS DISTINCT FROM NEW.junio THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('junio', true);
        v_old_values := v_old_values || jsonb_build_object('junio', OLD.junio);
        v_new_values := v_new_values || jsonb_build_object('junio', NEW.junio);
    END IF;

    IF OLD.julio IS DISTINCT FROM NEW.julio THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('julio', true);
        v_old_values := v_old_values || jsonb_build_object('julio', OLD.julio);
        v_new_values := v_new_values || jsonb_build_object('julio', NEW.julio);
    END IF;

    IF OLD.agosto IS DISTINCT FROM NEW.agosto THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('agosto', true);
        v_old_values := v_old_values || jsonb_build_object('agosto', OLD.agosto);
        v_new_values := v_new_values || jsonb_build_object('agosto', NEW.agosto);
    END IF;

    IF OLD.setiembre IS DISTINCT FROM NEW.setiembre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('setiembre', true);
        v_old_values := v_old_values || jsonb_build_object('setiembre', OLD.setiembre);
        v_new_values := v_new_values || jsonb_build_object('setiembre', NEW.setiembre);
    END IF;

    IF OLD.octubre IS DISTINCT FROM NEW.octubre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('octubre', true);
        v_old_values := v_old_values || jsonb_build_object('octubre', OLD.octubre);
        v_new_values := v_new_values || jsonb_build_object('octubre', NEW.octubre);
    END IF;

    IF OLD.noviembre IS DISTINCT FROM NEW.noviembre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('noviembre', true);
        v_old_values := v_old_values || jsonb_build_object('noviembre', OLD.noviembre);
        v_new_values := v_new_values || jsonb_build_object('noviembre', NEW.noviembre);
    END IF;

    IF OLD.diciembre IS DISTINCT FROM NEW.diciembre THEN
        v_changed_fields := v_changed_fields || jsonb_build_object('diciembre', true);
        v_old_values := v_old_values || jsonb_build_object('diciembre', OLD.diciembre);
        v_new_values := v_new_values || jsonb_build_object('diciembre', NEW.diciembre);
    END IF;

    -- INTENTAR insertar el log (con manejo de errores mejorado)
    IF jsonb_object_keys(v_changed_fields) IS NOT NULL THEN
        BEGIN
            -- Deshabilitar RLS temporalmente para el INSERT (SECURITY DEFINER lo permite)
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
            -- Guardar el error pero no fallar el UPDATE
            v_error := SQLERRM;
            RAISE WARNING 'ventas_mensuales_audit_trigger ERROR: % (SQLSTATE: %)', v_error, SQLSTATE;
            -- Intentar insertar un log de error
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
                    NULL,
                    'error: ' || v_error,
                    'error',
                    jsonb_build_object('error', v_error),
                    '{}'::jsonb,
                    '{}'::jsonb
                );
            EXCEPTION WHEN OTHERS THEN
                -- Si ni siquiera esto funciona, simplemente continuar
                NULL;
            END;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Función actualizada con mejor manejo de errores.' as resultado;
SELECT 'Ahora prueba desde la aplicación web y luego ejecuta:' as instruccion;
SELECT 'SELECT * FROM ventas_mensuales_audit_log ORDER BY created_at DESC LIMIT 10;' as consulta;
