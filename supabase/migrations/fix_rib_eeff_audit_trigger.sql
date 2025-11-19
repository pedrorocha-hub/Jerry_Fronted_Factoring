-- Migration: Fix RIB EEFF Audit Trigger
-- Problema: El trigger estaba guardando '{"aggregated": true}' en changed_fields
-- Solución: Detectar y registrar correctamente los campos modificados

-- Drop existing triggers and function if they exist
DROP TRIGGER IF EXISTS rib_eeff_audit_trigger ON public.rib_eeff CASCADE;
DROP TRIGGER IF EXISTS trigger_log_rib_eeff_changes ON public.rib_eeff CASCADE;
DROP FUNCTION IF EXISTS public.log_rib_eeff_changes() CASCADE;

-- Create the fixed audit log function
CREATE OR REPLACE FUNCTION public.log_rib_eeff_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_user_full_name TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    v_old_value TEXT;
    v_new_value TEXT;
    v_report_id UUID;
    v_key_name TEXT;
    v_txid BIGINT;
    v_existing_log_id UUID;
    
    -- Campos de negocio que queremos monitorear en RIB EEFF
    v_monitored_fields TEXT[] := ARRAY[
        'ruc',
        'tipo_entidad',
        'anio_reporte',
        'status',
        'solicitud_id',
        'activo_caja_inversiones_disponible',
        'activo_cuentas_por_cobrar_del_giro',
        'activo_existencias',
        'activo_total_activo_circulante',
        'activo_activo_fijo_neto',
        'activo_total_activos_no_circulantes',
        'activo_total_activos',
        'pasivo_sobregiro_bancos_y_obligaciones_corto_plazo',
        'pasivo_cuentas_por_pagar_del_giro',
        'pasivo_total_pasivos_circulantes',
        'pasivo_total_pasivos_no_circulantes',
        'pasivo_total_pasivos',
        'patrimonio_neto_capital_pagado',
        'patrimonio_neto_reserva_legal',
        'patrimonio_neto_utilidad_perdida_acumulada',
        'patrimonio_neto_utilidad_perdida_del_ejercicio',
        'patrimonio_neto_total_patrimonio',
        'patrimonio_neto_total_pasivos_y_patrimonio'
    ];
BEGIN
    -- Obtener transaction ID y report ID
    v_txid := txid_current();
    v_report_id := COALESCE(NEW.id, OLD.id);
    v_key_name := COALESCE(NEW.anio_reporte::TEXT, OLD.anio_reporte::TEXT) || '_' || COALESCE(NEW.tipo_entidad, OLD.tipo_entidad);

    -- Determinar la acción
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'deleted';
    END IF;

    -- Obtener información del usuario
    v_user_id := auth.uid();
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    SELECT full_name INTO v_user_full_name FROM public.profiles WHERE id = v_user_id;
    v_user_full_name := COALESCE(v_user_full_name, v_user_email, 'Sistema');

    -- Detectar campos cambiados (solo para UPDATE)
    IF TG_OP = 'UPDATE' THEN
        FOREACH v_field IN ARRAY v_monitored_fields
        LOOP
            -- Convertir valores a texto para comparación
            EXECUTE format('SELECT ($1).%I::TEXT', v_field) INTO v_old_value USING OLD;
            EXECUTE format('SELECT ($1).%I::TEXT', v_field) INTO v_new_value USING NEW;
            
            -- Si los valores son diferentes, agregar al registro
            IF v_old_value IS DISTINCT FROM v_new_value THEN
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                v_old_values := v_old_values || jsonb_build_object(v_field, v_old_value);
                v_new_values := v_new_values || jsonb_build_object(v_field, v_new_value);
            END IF;
        END LOOP;
        
        -- Si no hay cambios en campos monitoreados, no crear log
        IF v_changed_fields = '{}'::JSONB THEN
            RETURN NEW;
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        -- Para INSERT, guardar todos los campos monitoreados como "nuevos"
        FOREACH v_field IN ARRAY v_monitored_fields
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT', v_field) INTO v_new_value USING NEW;
            IF v_new_value IS NOT NULL THEN
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                v_new_values := v_new_values || jsonb_build_object(v_field, v_new_value);
            END IF;
        END LOOP;
    ELSIF TG_OP = 'DELETE' THEN
        -- Para DELETE, guardar todos los campos monitoreados como "viejos"
        FOREACH v_field IN ARRAY v_monitored_fields
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT', v_field) INTO v_old_value USING OLD;
            IF v_old_value IS NOT NULL THEN
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                v_old_values := v_old_values || jsonb_build_object(v_field, v_old_value);
            END IF;
        END LOOP;
    END IF;

    -- Buscar si ya existe un log para esta transacción
    SELECT id INTO v_existing_log_id
    FROM public.rib_eeff_audit_log
    WHERE rib_eeff_id = v_report_id
      AND transaction_id = v_txid
    LIMIT 1;

    IF v_existing_log_id IS NOT NULL THEN
        -- Actualizar el log existente agregando los cambios
        UPDATE public.rib_eeff_audit_log
        SET 
            changed_fields = COALESCE(changed_fields, '{}'::JSONB) || v_changed_fields,
            old_values = COALESCE(old_values, '{}'::JSONB) || v_old_values,
            new_values = COALESCE(new_values, '{}'::JSONB) || v_new_values,
            action = v_action
        WHERE id = v_existing_log_id;
    ELSE
        -- Crear nuevo log
        INSERT INTO public.rib_eeff_audit_log (
            rib_eeff_id,
            user_id,
            user_email,
            user_full_name,
            action,
            changed_fields,
            old_values,
            new_values,
            transaction_id
        ) VALUES (
            v_report_id,
            v_user_id,
            v_user_email,
            v_user_full_name,
            v_action,
            v_changed_fields,
            v_old_values,
            v_new_values,
            v_txid
        );
    END IF;

    -- Retornar el registro apropiado según la operación
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- Si hay un error en el trigger, logearlo pero no fallar la operación principal
    RAISE WARNING 'Error en trigger de auditoría RIB EEFF: %', SQLERRM;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (AFTER para todas las operaciones)
CREATE TRIGGER rib_eeff_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.rib_eeff
  FOR EACH ROW
  EXECUTE FUNCTION public.log_rib_eeff_changes();

-- Add comments
COMMENT ON FUNCTION public.log_rib_eeff_changes() IS 
  'Audit trigger for rib_eeff. Tracks business field changes with proper field detection.';

COMMENT ON TRIGGER rib_eeff_audit_trigger ON public.rib_eeff IS
  'Tracks changes to business fields in rib_eeff records';

