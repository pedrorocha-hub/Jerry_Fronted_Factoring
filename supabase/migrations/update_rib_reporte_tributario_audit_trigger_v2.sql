-- Migration: Update RIB Reporte Tributario Audit Trigger (Version 2 - Optimized)
-- This version focuses on business fields only and aggregates changes per transaction

-- Drop existing triggers and function if they exist (CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_trigger ON public.rib_reporte_tributario CASCADE;
DROP TRIGGER IF EXISTS trigger_log_rib_reporte_tributario_changes ON public.rib_reporte_tributario CASCADE;
DROP FUNCTION IF EXISTS public.log_rib_reporte_tributario_changes() CASCADE;

-- Create the optimized audit log function
CREATE OR REPLACE FUNCTION public.log_rib_reporte_tributario_changes()
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
    v_report_id UUID; -- Changed from TEXT to UUID
    v_key_name TEXT;
    v_txid BIGINT;
    v_existing_log_id UUID;
    
    -- SOLO los campos de negocio que queremos monitorear
    v_monitored_fields TEXT[] := ARRAY[
        'nombre_empresa',
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
    -- Obtener transaction ID y report ID
    v_txid := txid_current();
    v_report_id := COALESCE(NEW.id, OLD.id);
    v_key_name := COALESCE(NEW.anio::TEXT, OLD.anio::TEXT) || '_' || COALESCE(NEW.tipo_entidad, OLD.tipo_entidad);

    -- Determinar el tipo de acción
    IF TG_OP = 'INSERT' THEN
        -- NO auditar INSERTs (para evitar ruido cuando se crean registros nuevos)
        RETURN NULL;

    ELSIF TG_OP = 'DELETE' THEN
        -- NO auditar DELETEs (para evitar ruido cuando se eliminan registros)
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
            -- Extraer valores como texto para comparación dinámica
            EXECUTE format('SELECT ($1).%I::TEXT', v_field) INTO v_old_value USING OLD;
            EXECUTE format('SELECT ($1).%I::TEXT', v_field) INTO v_new_value USING NEW;
            
            IF v_old_value IS DISTINCT FROM v_new_value THEN
                -- Marcar el campo como cambiado
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                
                -- Guardar valor anterior y nuevo con contexto de año y entidad
                v_old_values := v_old_values || jsonb_build_object(v_field, v_old_value);
                v_new_values := v_new_values || jsonb_build_object(v_field, v_new_value);
            END IF;
        END LOOP;

        -- Solo continuar si hubo cambios en campos monitoreados
        IF v_changed_fields = '{}'::JSONB THEN
            RETURN NULL;
        END IF;

        -- Agregar contexto (año y tipo de entidad) a los valores
        v_old_values := jsonb_build_object(v_key_name, v_old_values || jsonb_build_object('anio', OLD.anio, 'tipo_entidad', OLD.tipo_entidad));
        v_new_values := jsonb_build_object(v_key_name, v_new_values || jsonb_build_object('anio', NEW.anio, 'tipo_entidad', NEW.tipo_entidad));

        -- Verificar si ya existe un log para esta transacción y reporte
        SELECT id INTO v_existing_log_id
        FROM public.rib_reporte_tributario_audit_log
        WHERE rib_reporte_tributario_id = v_report_id
          AND transaction_id = v_txid
        LIMIT 1;

        IF v_existing_log_id IS NOT NULL THEN
            -- Ya existe un log, agregar cambios
            UPDATE public.rib_reporte_tributario_audit_log
            SET 
                changed_fields = changed_fields || v_changed_fields,
                old_values = old_values || v_old_values,
                new_values = new_values || v_new_values,
                -- Actualizar la acción si fue un cambio de status
                action = CASE 
                    WHEN v_action = 'status_changed' THEN 'status_changed'
                    ELSE action
                END
            WHERE id = v_existing_log_id;
        ELSE
            -- No existe log, crear uno nuevo
            -- Obtener información del usuario
            BEGIN
                v_user_id := (auth.jwt() ->> 'sub')::UUID;
                v_user_email := auth.jwt() ->> 'email';
            EXCEPTION WHEN OTHERS THEN
                v_user_id := NULL;
                v_user_email := NULL;
            END;
            
            -- Obtener el nombre completo desde la tabla de perfiles
            IF v_user_id IS NOT NULL THEN
                SELECT full_name INTO v_user_full_name
                FROM public.profiles
                WHERE id = v_user_id;
            END IF;

            -- Si no se encuentra un nombre, usamos el email como alternativa
            v_user_full_name := COALESCE(v_user_full_name, v_user_email, 'Sistema');

            INSERT INTO public.rib_reporte_tributario_audit_log (
                rib_reporte_tributario_id,
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
    END IF;

    RETURN NULL; -- Para triggers AFTER, el valor de retorno se ignora
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER rib_reporte_tributario_audit_trigger
  AFTER UPDATE ON public.rib_reporte_tributario
  FOR EACH ROW
  EXECUTE FUNCTION public.log_rib_reporte_tributario_changes();

-- Add comments
COMMENT ON FUNCTION public.log_rib_reporte_tributario_changes() IS 
  'Optimized audit trigger for rib_reporte_tributario. Only tracks business field changes (no INSERTs/DELETEs). Aggregates changes per transaction.';

COMMENT ON TRIGGER rib_reporte_tributario_audit_trigger ON public.rib_reporte_tributario IS
  'Tracks changes to business fields in rib_reporte_tributario records';

