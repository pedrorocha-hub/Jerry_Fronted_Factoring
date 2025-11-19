-- Migration: Update RIB Reporte Tributario Audit Trigger to include nombre_empresa
-- This trigger tracks all changes to rib_reporte_tributario records, including nombre_empresa

-- Drop existing triggers and function if they exist (CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_trigger ON public.rib_reporte_tributario CASCADE;
DROP TRIGGER IF EXISTS trigger_log_rib_reporte_tributario_changes ON public.rib_reporte_tributario CASCADE;
DROP FUNCTION IF EXISTS public.log_rib_reporte_tributario_changes() CASCADE;

-- Create the audit log function
CREATE OR REPLACE FUNCTION public.log_rib_reporte_tributario_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_txid BIGINT;
  existing_log_id UUID;
  current_user_id UUID;
  current_user_email TEXT;
  current_user_full_name TEXT;
  report_id UUID; -- Changed from TEXT to UUID
  key_name TEXT;
  old_payload JSONB;
  new_payload JSONB;
  changed_fields_obj JSONB;
  field_name TEXT;
BEGIN
  -- Get common values
  current_txid := txid_current();
  report_id := COALESCE(NEW.id, OLD.id);
  key_name := COALESCE(NEW.anio::TEXT, OLD.anio::TEXT) || '_' || COALESCE(NEW.tipo_entidad, OLD.tipo_entidad);

  -- Check for an existing log entry for this transaction and report
  SELECT id INTO existing_log_id
  FROM public.rib_reporte_tributario_audit_log
  WHERE rib_reporte_tributario_id = report_id
    AND transaction_id = current_txid
  LIMIT 1;

  IF existing_log_id IS NOT NULL THEN
    -- An entry already exists, so we aggregate changes
    IF TG_OP = 'INSERT' THEN
      UPDATE public.rib_reporte_tributario_audit_log
      SET new_values = new_values || jsonb_build_object(key_name, to_jsonb(NEW))
      WHERE id = existing_log_id;
      
    ELSIF TG_OP = 'UPDATE' THEN
      -- Build changed_fields object for this specific record
      changed_fields_obj := '{}'::jsonb;
      
      -- Check each field for changes, including nombre_empresa
      IF OLD.ruc IS DISTINCT FROM NEW.ruc THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('ruc', true);
      END IF;
      
      IF OLD.nombre_empresa IS DISTINCT FROM NEW.nombre_empresa THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('nombre_empresa', true);
      END IF;
      
      IF OLD.anio IS DISTINCT FROM NEW.anio THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('anio', true);
      END IF;
      
      IF OLD.tipo_entidad IS DISTINCT FROM NEW.tipo_entidad THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('tipo_entidad', true);
      END IF;
      
      IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('solicitud_id', true);
      END IF;
      
      IF OLD.cuentas_por_cobrar_giro IS DISTINCT FROM NEW.cuentas_por_cobrar_giro THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('cuentas_por_cobrar_giro', true);
      END IF;
      
      IF OLD.total_activos IS DISTINCT FROM NEW.total_activos THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_activos', true);
      END IF;
      
      IF OLD.cuentas_por_pagar_giro IS DISTINCT FROM NEW.cuentas_por_pagar_giro THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('cuentas_por_pagar_giro', true);
      END IF;
      
      IF OLD.total_pasivos IS DISTINCT FROM NEW.total_pasivos THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_pasivos', true);
      END IF;
      
      IF OLD.capital_pagado IS DISTINCT FROM NEW.capital_pagado THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('capital_pagado', true);
      END IF;
      
      IF OLD.total_patrimonio IS DISTINCT FROM NEW.total_patrimonio THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_patrimonio', true);
      END IF;
      
      IF OLD.total_pasivo_patrimonio IS DISTINCT FROM NEW.total_pasivo_patrimonio THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_pasivo_patrimonio', true);
      END IF;
      
      IF OLD.ingreso_ventas IS DISTINCT FROM NEW.ingreso_ventas THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('ingreso_ventas', true);
      END IF;
      
      IF OLD.utilidad_bruta IS DISTINCT FROM NEW.utilidad_bruta THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('utilidad_bruta', true);
      END IF;
      
      IF OLD.utilidad_antes_impuesto IS DISTINCT FROM NEW.utilidad_antes_impuesto THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('utilidad_antes_impuesto', true);
      END IF;
      
      IF OLD.solvencia IS DISTINCT FROM NEW.solvencia THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('solvencia', true);
      END IF;
      
      IF OLD.gestion IS DISTINCT FROM NEW.gestion THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('gestion', true);
      END IF;
      
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('status', true);
      END IF;

      UPDATE public.rib_reporte_tributario_audit_log
      SET old_values = old_values || jsonb_build_object(key_name, to_jsonb(OLD)),
          new_values = new_values || jsonb_build_object(key_name, to_jsonb(NEW)),
          changed_fields = changed_fields || changed_fields_obj
      WHERE id = existing_log_id;
      
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.rib_reporte_tributario_audit_log
      SET old_values = old_values || jsonb_build_object(key_name, to_jsonb(OLD))
      WHERE id = existing_log_id;
    END IF;
    
  ELSE
    -- No entry exists, create a new one
    -- Obtener el ID y email del usuario desde el JWT
    BEGIN
      current_user_id := (auth.jwt() ->> 'sub')::UUID;
      current_user_email := auth.jwt() ->> 'email';
    EXCEPTION WHEN OTHERS THEN
      current_user_id := NULL;
      current_user_email := NULL;
    END;
    
    -- Obtener el nombre completo desde la tabla de perfiles
    IF current_user_id IS NOT NULL THEN
      SELECT full_name INTO current_user_full_name
      FROM public.profiles
      WHERE id = current_user_id;
    END IF;

    -- Si no se encuentra un nombre, usamos el email como alternativa
    current_user_full_name := COALESCE(current_user_full_name, current_user_email, 'Sistema');

    -- Determine action and build payloads
    IF TG_OP = 'INSERT' THEN
      new_payload := jsonb_build_object(key_name, to_jsonb(NEW));
      old_payload := '{}'::jsonb;
      changed_fields_obj := jsonb_build_object('action', 'insert');
      
    ELSIF TG_OP = 'DELETE' THEN
      old_payload := jsonb_build_object(key_name, to_jsonb(OLD));
      new_payload := '{}'::jsonb;
      changed_fields_obj := jsonb_build_object('action', 'delete');
      
    ELSE -- UPDATE
      old_payload := jsonb_build_object(key_name, to_jsonb(OLD));
      new_payload := jsonb_build_object(key_name, to_jsonb(NEW));
      
      -- Build changed_fields object
      changed_fields_obj := '{}'::jsonb;
      
      -- Check each field for changes, including nombre_empresa
      IF OLD.ruc IS DISTINCT FROM NEW.ruc THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('ruc', true);
      END IF;
      
      IF OLD.nombre_empresa IS DISTINCT FROM NEW.nombre_empresa THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('nombre_empresa', true);
      END IF;
      
      IF OLD.anio IS DISTINCT FROM NEW.anio THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('anio', true);
      END IF;
      
      IF OLD.tipo_entidad IS DISTINCT FROM NEW.tipo_entidad THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('tipo_entidad', true);
      END IF;
      
      IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('solicitud_id', true);
      END IF;
      
      IF OLD.cuentas_por_cobrar_giro IS DISTINCT FROM NEW.cuentas_por_cobrar_giro THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('cuentas_por_cobrar_giro', true);
      END IF;
      
      IF OLD.total_activos IS DISTINCT FROM NEW.total_activos THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_activos', true);
      END IF;
      
      IF OLD.cuentas_por_pagar_giro IS DISTINCT FROM NEW.cuentas_por_pagar_giro THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('cuentas_por_pagar_giro', true);
      END IF;
      
      IF OLD.total_pasivos IS DISTINCT FROM NEW.total_pasivos THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_pasivos', true);
      END IF;
      
      IF OLD.capital_pagado IS DISTINCT FROM NEW.capital_pagado THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('capital_pagado', true);
      END IF;
      
      IF OLD.total_patrimonio IS DISTINCT FROM NEW.total_patrimonio THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_patrimonio', true);
      END IF;
      
      IF OLD.total_pasivo_patrimonio IS DISTINCT FROM NEW.total_pasivo_patrimonio THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('total_pasivo_patrimonio', true);
      END IF;
      
      IF OLD.ingreso_ventas IS DISTINCT FROM NEW.ingreso_ventas THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('ingreso_ventas', true);
      END IF;
      
      IF OLD.utilidad_bruta IS DISTINCT FROM NEW.utilidad_bruta THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('utilidad_bruta', true);
      END IF;
      
      IF OLD.utilidad_antes_impuesto IS DISTINCT FROM NEW.utilidad_antes_impuesto THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('utilidad_antes_impuesto', true);
      END IF;
      
      IF OLD.solvencia IS DISTINCT FROM NEW.solvencia THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('solvencia', true);
      END IF;
      
      IF OLD.gestion IS DISTINCT FROM NEW.gestion THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('gestion', true);
      END IF;
      
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        changed_fields_obj := changed_fields_obj || jsonb_build_object('status', true);
      END IF;
      
      changed_fields_obj := changed_fields_obj || jsonb_build_object('action', 'update');
    END IF;

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
      report_id,
      current_user_id,
      current_user_email,
      current_user_full_name,
      'updated',
      changed_fields_obj,
      old_payload,
      new_payload,
      current_txid
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER rib_reporte_tributario_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.rib_reporte_tributario
  FOR EACH ROW
  EXECUTE FUNCTION public.log_rib_reporte_tributario_changes();

-- Add comment
COMMENT ON FUNCTION public.log_rib_reporte_tributario_changes() IS 
  'Audit trigger function for rib_reporte_tributario table. Tracks all changes including nombre_empresa field.';

