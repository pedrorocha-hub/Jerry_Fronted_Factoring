-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE RIB EEFF
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla rib_eeff
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.rib_eeff_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rib_eeff_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_rib_eeff_audit_log_rib_eeff_id 
    ON public.rib_eeff_audit_log(rib_eeff_id);

CREATE INDEX IF NOT EXISTS idx_rib_eeff_audit_log_created_at 
    ON public.rib_eeff_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rib_eeff_audit_log_user_id 
    ON public.rib_eeff_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.rib_eeff_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view rib eeff audit logs" ON public.rib_eeff_audit_log;
DROP POLICY IF EXISTS "System can insert rib eeff audit logs" ON public.rib_eeff_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view rib eeff audit logs" 
    ON public.rib_eeff_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert rib eeff audit logs" 
    ON public.rib_eeff_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.rib_eeff_audit_trigger()
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
        'tipo_entidad',
        'anio_reporte',
        -- Activos principales
        'activo_caja_inversiones_disponible',
        'activo_cuentas_por_cobrar_del_giro',
        'activo_existencias',
        'activo_total_activo_circulante',
        'activo_activo_fijo_neto',
        'activo_total_activos',
        -- Pasivos principales
        'pasivo_sobregiro_bancos_y_obligaciones_corto_plazo',
        'pasivo_cuentas_por_pagar_del_giro',
        'pasivo_total_pasivos_circulantes',
        'pasivo_total_pasivos',
        -- Patrimonio principales
        'patrimonio_neto_capital_pagado',
        'patrimonio_neto_total_patrimonio',
        'patrimonio_neto_total_pasivos_y_patrimonio'
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
                    WHEN 'status' THEN OLD.status IS DISTINCT FROM NEW.status
                    WHEN 'solicitud_id' THEN OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id
                    WHEN 'tipo_entidad' THEN OLD.tipo_entidad IS DISTINCT FROM NEW.tipo_entidad
                    WHEN 'anio_reporte' THEN OLD.anio_reporte IS DISTINCT FROM NEW.anio_reporte
                    -- Activos
                    WHEN 'activo_caja_inversiones_disponible' THEN OLD.activo_caja_inversiones_disponible IS DISTINCT FROM NEW.activo_caja_inversiones_disponible
                    WHEN 'activo_cuentas_por_cobrar_del_giro' THEN OLD.activo_cuentas_por_cobrar_del_giro IS DISTINCT FROM NEW.activo_cuentas_por_cobrar_del_giro
                    WHEN 'activo_existencias' THEN OLD.activo_existencias IS DISTINCT FROM NEW.activo_existencias
                    WHEN 'activo_total_activo_circulante' THEN OLD.activo_total_activo_circulante IS DISTINCT FROM NEW.activo_total_activo_circulante
                    WHEN 'activo_activo_fijo_neto' THEN OLD.activo_activo_fijo_neto IS DISTINCT FROM NEW.activo_activo_fijo_neto
                    WHEN 'activo_total_activos' THEN OLD.activo_total_activos IS DISTINCT FROM NEW.activo_total_activos
                    -- Pasivos
                    WHEN 'pasivo_sobregiro_bancos_y_obligaciones_corto_plazo' THEN OLD.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo IS DISTINCT FROM NEW.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo
                    WHEN 'pasivo_cuentas_por_pagar_del_giro' THEN OLD.pasivo_cuentas_por_pagar_del_giro IS DISTINCT FROM NEW.pasivo_cuentas_por_pagar_del_giro
                    WHEN 'pasivo_total_pasivos_circulantes' THEN OLD.pasivo_total_pasivos_circulantes IS DISTINCT FROM NEW.pasivo_total_pasivos_circulantes
                    WHEN 'pasivo_total_pasivos' THEN OLD.pasivo_total_pasivos IS DISTINCT FROM NEW.pasivo_total_pasivos
                    -- Patrimonio
                    WHEN 'patrimonio_neto_capital_pagado' THEN OLD.patrimonio_neto_capital_pagado IS DISTINCT FROM NEW.patrimonio_neto_capital_pagado
                    WHEN 'patrimonio_neto_total_patrimonio' THEN OLD.patrimonio_neto_total_patrimonio IS DISTINCT FROM NEW.patrimonio_neto_total_patrimonio
                    WHEN 'patrimonio_neto_total_pasivos_y_patrimonio' THEN OLD.patrimonio_neto_total_pasivos_y_patrimonio IS DISTINCT FROM NEW.patrimonio_neto_total_pasivos_y_patrimonio
                    ELSE FALSE
                END
            ) THEN
                -- Marcar el campo como cambiado
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                
                -- Guardar valor anterior y nuevo (siempre incluir el año para referencia)
                v_old_values := v_old_values || jsonb_build_object('anio_reporte', to_jsonb(OLD.anio_reporte));
                v_old_values := v_old_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'status' THEN to_jsonb(OLD.status)
                        WHEN 'solicitud_id' THEN to_jsonb(OLD.solicitud_id)
                        WHEN 'tipo_entidad' THEN to_jsonb(OLD.tipo_entidad)
                        WHEN 'anio_reporte' THEN to_jsonb(OLD.anio_reporte)
                        -- Activos
                        WHEN 'activo_caja_inversiones_disponible' THEN to_jsonb(OLD.activo_caja_inversiones_disponible)
                        WHEN 'activo_cuentas_por_cobrar_del_giro' THEN to_jsonb(OLD.activo_cuentas_por_cobrar_del_giro)
                        WHEN 'activo_existencias' THEN to_jsonb(OLD.activo_existencias)
                        WHEN 'activo_total_activo_circulante' THEN to_jsonb(OLD.activo_total_activo_circulante)
                        WHEN 'activo_activo_fijo_neto' THEN to_jsonb(OLD.activo_activo_fijo_neto)
                        WHEN 'activo_total_activos' THEN to_jsonb(OLD.activo_total_activos)
                        -- Pasivos
                        WHEN 'pasivo_sobregiro_bancos_y_obligaciones_corto_plazo' THEN to_jsonb(OLD.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo)
                        WHEN 'pasivo_cuentas_por_pagar_del_giro' THEN to_jsonb(OLD.pasivo_cuentas_por_pagar_del_giro)
                        WHEN 'pasivo_total_pasivos_circulantes' THEN to_jsonb(OLD.pasivo_total_pasivos_circulantes)
                        WHEN 'pasivo_total_pasivos' THEN to_jsonb(OLD.pasivo_total_pasivos)
                        -- Patrimonio
                        WHEN 'patrimonio_neto_capital_pagado' THEN to_jsonb(OLD.patrimonio_neto_capital_pagado)
                        WHEN 'patrimonio_neto_total_patrimonio' THEN to_jsonb(OLD.patrimonio_neto_total_patrimonio)
                        WHEN 'patrimonio_neto_total_pasivos_y_patrimonio' THEN to_jsonb(OLD.patrimonio_neto_total_pasivos_y_patrimonio)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object('anio_reporte', to_jsonb(NEW.anio_reporte));
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'status' THEN to_jsonb(NEW.status)
                        WHEN 'solicitud_id' THEN to_jsonb(NEW.solicitud_id)
                        WHEN 'tipo_entidad' THEN to_jsonb(NEW.tipo_entidad)
                        WHEN 'anio_reporte' THEN to_jsonb(NEW.anio_reporte)
                        -- Activos
                        WHEN 'activo_caja_inversiones_disponible' THEN to_jsonb(NEW.activo_caja_inversiones_disponible)
                        WHEN 'activo_cuentas_por_cobrar_del_giro' THEN to_jsonb(NEW.activo_cuentas_por_cobrar_del_giro)
                        WHEN 'activo_existencias' THEN to_jsonb(NEW.activo_existencias)
                        WHEN 'activo_total_activo_circulante' THEN to_jsonb(NEW.activo_total_activo_circulante)
                        WHEN 'activo_activo_fijo_neto' THEN to_jsonb(NEW.activo_activo_fijo_neto)
                        WHEN 'activo_total_activos' THEN to_jsonb(NEW.activo_total_activos)
                        -- Pasivos
                        WHEN 'pasivo_sobregiro_bancos_y_obligaciones_corto_plazo' THEN to_jsonb(NEW.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo)
                        WHEN 'pasivo_cuentas_por_pagar_del_giro' THEN to_jsonb(NEW.pasivo_cuentas_por_pagar_del_giro)
                        WHEN 'pasivo_total_pasivos_circulantes' THEN to_jsonb(NEW.pasivo_total_pasivos_circulantes)
                        WHEN 'pasivo_total_pasivos' THEN to_jsonb(NEW.pasivo_total_pasivos)
                        -- Patrimonio
                        WHEN 'patrimonio_neto_capital_pagado' THEN to_jsonb(NEW.patrimonio_neto_capital_pagado)
                        WHEN 'patrimonio_neto_total_patrimonio' THEN to_jsonb(NEW.patrimonio_neto_total_patrimonio)
                        WHEN 'patrimonio_neto_total_pasivos_y_patrimonio' THEN to_jsonb(NEW.patrimonio_neto_total_pasivos_y_patrimonio)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.rib_eeff_audit_log (
                rib_eeff_id,
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

-- Paso 6: Crear los triggers en la tabla rib_eeff
DROP TRIGGER IF EXISTS rib_eeff_audit_insert ON public.rib_eeff;
CREATE TRIGGER rib_eeff_audit_insert
    AFTER INSERT ON public.rib_eeff
    FOR EACH ROW
    EXECUTE FUNCTION public.rib_eeff_audit_trigger();

DROP TRIGGER IF EXISTS rib_eeff_audit_update ON public.rib_eeff;
CREATE TRIGGER rib_eeff_audit_update
    AFTER UPDATE ON public.rib_eeff
    FOR EACH ROW
    EXECUTE FUNCTION public.rib_eeff_audit_trigger();

DROP TRIGGER IF EXISTS rib_eeff_audit_delete ON public.rib_eeff;
CREATE TRIGGER rib_eeff_audit_delete
    AFTER DELETE ON public.rib_eeff
    FOR EACH ROW
    EXECUTE FUNCTION public.rib_eeff_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'rib_eeff_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'rib_eeff_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'rib_eeff_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================
