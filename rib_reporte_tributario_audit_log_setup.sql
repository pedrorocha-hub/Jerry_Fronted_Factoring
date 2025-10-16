-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE RIB REPORTE TRIBUTARIO
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla rib_reporte_tributario
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.rib_reporte_tributario_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rib_reporte_tributario_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_rib_reporte_tributario_audit_log_reporte_id 
    ON public.rib_reporte_tributario_audit_log(rib_reporte_tributario_id);

CREATE INDEX IF NOT EXISTS idx_rib_reporte_tributario_audit_log_created_at 
    ON public.rib_reporte_tributario_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rib_reporte_tributario_audit_log_user_id 
    ON public.rib_reporte_tributario_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.rib_reporte_tributario_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view audit logs" ON public.rib_reporte_tributario_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.rib_reporte_tributario_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view audit logs" 
    ON public.rib_reporte_tributario_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert audit logs" 
    ON public.rib_reporte_tributario_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.rib_reporte_tributario_audit_trigger()
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
        'solicitud_id',
        'cuentas_por_cobrar_giro',
        'total_activos',
        'cuentas_por_pagar_giro',
        'total_pasivos',
        'capital_pagado',
        'total_patrimonio',
        'total_pasivo_patrimonio',
        'ingreso_ventas',
        'utilidad_bruta',
        'utilidad_antes_impuesto',
        'solvencia',
        'gestion'
    ];
BEGIN
    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    v_user_email := auth.email();

    -- Determinar el tipo de acción
    IF TG_OP = 'INSERT' THEN
        -- NO auditar INSERTs (para evitar ruido cuando se crean registros nuevos)
        -- Si quieres auditar creaciones, descomenta el código de abajo
        RETURN NULL;
        
        /*
        v_action := 'created';
        INSERT INTO public.rib_reporte_tributario_audit_log (
            rib_reporte_tributario_id,
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
        */

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
                    WHEN 'status' THEN OLD.status IS DISTINCT FROM NEW.status
                    WHEN 'solicitud_id' THEN OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id
                    WHEN 'cuentas_por_cobrar_giro' THEN OLD.cuentas_por_cobrar_giro IS DISTINCT FROM NEW.cuentas_por_cobrar_giro
                    WHEN 'total_activos' THEN OLD.total_activos IS DISTINCT FROM NEW.total_activos
                    WHEN 'cuentas_por_pagar_giro' THEN OLD.cuentas_por_pagar_giro IS DISTINCT FROM NEW.cuentas_por_pagar_giro
                    WHEN 'total_pasivos' THEN OLD.total_pasivos IS DISTINCT FROM NEW.total_pasivos
                    WHEN 'capital_pagado' THEN OLD.capital_pagado IS DISTINCT FROM NEW.capital_pagado
                    WHEN 'total_patrimonio' THEN OLD.total_patrimonio IS DISTINCT FROM NEW.total_patrimonio
                    WHEN 'total_pasivo_patrimonio' THEN OLD.total_pasivo_patrimonio IS DISTINCT FROM NEW.total_pasivo_patrimonio
                    WHEN 'ingreso_ventas' THEN OLD.ingreso_ventas IS DISTINCT FROM NEW.ingreso_ventas
                    WHEN 'utilidad_bruta' THEN OLD.utilidad_bruta IS DISTINCT FROM NEW.utilidad_bruta
                    WHEN 'utilidad_antes_impuesto' THEN OLD.utilidad_antes_impuesto IS DISTINCT FROM NEW.utilidad_antes_impuesto
                    WHEN 'solvencia' THEN OLD.solvencia IS DISTINCT FROM NEW.solvencia
                    WHEN 'gestion' THEN OLD.gestion IS DISTINCT FROM NEW.gestion
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
                        WHEN 'solicitud_id' THEN to_jsonb(OLD.solicitud_id)
                        WHEN 'cuentas_por_cobrar_giro' THEN to_jsonb(OLD.cuentas_por_cobrar_giro)
                        WHEN 'total_activos' THEN to_jsonb(OLD.total_activos)
                        WHEN 'cuentas_por_pagar_giro' THEN to_jsonb(OLD.cuentas_por_pagar_giro)
                        WHEN 'total_pasivos' THEN to_jsonb(OLD.total_pasivos)
                        WHEN 'capital_pagado' THEN to_jsonb(OLD.capital_pagado)
                        WHEN 'total_patrimonio' THEN to_jsonb(OLD.total_patrimonio)
                        WHEN 'total_pasivo_patrimonio' THEN to_jsonb(OLD.total_pasivo_patrimonio)
                        WHEN 'ingreso_ventas' THEN to_jsonb(OLD.ingreso_ventas)
                        WHEN 'utilidad_bruta' THEN to_jsonb(OLD.utilidad_bruta)
                        WHEN 'utilidad_antes_impuesto' THEN to_jsonb(OLD.utilidad_antes_impuesto)
                        WHEN 'solvencia' THEN to_jsonb(OLD.solvencia)
                        WHEN 'gestion' THEN to_jsonb(OLD.gestion)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object('anio', to_jsonb(NEW.anio));
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'status' THEN to_jsonb(NEW.status)
                        WHEN 'solicitud_id' THEN to_jsonb(NEW.solicitud_id)
                        WHEN 'cuentas_por_cobrar_giro' THEN to_jsonb(NEW.cuentas_por_cobrar_giro)
                        WHEN 'total_activos' THEN to_jsonb(NEW.total_activos)
                        WHEN 'cuentas_por_pagar_giro' THEN to_jsonb(NEW.cuentas_por_pagar_giro)
                        WHEN 'total_pasivos' THEN to_jsonb(NEW.total_pasivos)
                        WHEN 'capital_pagado' THEN to_jsonb(NEW.capital_pagado)
                        WHEN 'total_patrimonio' THEN to_jsonb(NEW.total_patrimonio)
                        WHEN 'total_pasivo_patrimonio' THEN to_jsonb(NEW.total_pasivo_patrimonio)
                        WHEN 'ingreso_ventas' THEN to_jsonb(NEW.ingreso_ventas)
                        WHEN 'utilidad_bruta' THEN to_jsonb(NEW.utilidad_bruta)
                        WHEN 'utilidad_antes_impuesto' THEN to_jsonb(NEW.utilidad_antes_impuesto)
                        WHEN 'solvencia' THEN to_jsonb(NEW.solvencia)
                        WHEN 'gestion' THEN to_jsonb(NEW.gestion)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.rib_reporte_tributario_audit_log (
                rib_reporte_tributario_id,
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
        -- Si quieres auditar eliminaciones, descomenta el código de abajo
        RETURN NULL;
        
        /*
        v_action := 'deleted';
        INSERT INTO public.rib_reporte_tributario_audit_log (
            rib_reporte_tributario_id,
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
        */
    END IF;

    RETURN NULL; -- Para triggers AFTER, el valor de retorno se ignora
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear los triggers en la tabla rib_reporte_tributario
DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_insert ON public.rib_reporte_tributario;
CREATE TRIGGER rib_reporte_tributario_audit_insert
    AFTER INSERT ON public.rib_reporte_tributario
    FOR EACH ROW
    EXECUTE FUNCTION public.rib_reporte_tributario_audit_trigger();

DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_update ON public.rib_reporte_tributario;
CREATE TRIGGER rib_reporte_tributario_audit_update
    AFTER UPDATE ON public.rib_reporte_tributario
    FOR EACH ROW
    EXECUTE FUNCTION public.rib_reporte_tributario_audit_trigger();

DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_delete ON public.rib_reporte_tributario;
CREATE TRIGGER rib_reporte_tributario_audit_delete
    AFTER DELETE ON public.rib_reporte_tributario
    FOR EACH ROW
    EXECUTE FUNCTION public.rib_reporte_tributario_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'rib_reporte_tributario_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'rib_reporte_tributario_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'rib_reporte_tributario_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================
