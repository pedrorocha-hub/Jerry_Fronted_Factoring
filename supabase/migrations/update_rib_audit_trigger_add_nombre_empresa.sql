-- Actualizar la función de auditoría de RIB para incluir el campo nombre_empresa

CREATE OR REPLACE FUNCTION public.log_rib_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields_json JSONB := '{}'::jsonb;
  old_values_json JSONB := '{}'::jsonb;
  new_values_json JSONB := '{}'::jsonb;
  current_user_email TEXT;
  action_type TEXT;
BEGIN
  -- Obtener email del usuario actual
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    new_values_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar si es cambio de estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      action_type := 'status_changed';
    ELSE
      action_type := 'updated';
    END IF;

    -- Comparar campos y registrar solo los que cambiaron
    IF OLD.ruc IS DISTINCT FROM NEW.ruc THEN
      changed_fields_json := changed_fields_json || '{"ruc": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('ruc', OLD.ruc);
      new_values_json := new_values_json || jsonb_build_object('ruc', NEW.ruc);
    END IF;

    -- NUEVO CAMPO: nombre_empresa
    IF OLD.nombre_empresa IS DISTINCT FROM NEW.nombre_empresa THEN
      changed_fields_json := changed_fields_json || '{"nombre_empresa": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('nombre_empresa', OLD.nombre_empresa);
      new_values_json := new_values_json || jsonb_build_object('nombre_empresa', NEW.nombre_empresa);
    END IF;

    IF OLD.direccion IS DISTINCT FROM NEW.direccion THEN
      changed_fields_json := changed_fields_json || '{"direccion": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('direccion', OLD.direccion);
      new_values_json := new_values_json || jsonb_build_object('direccion', NEW.direccion);
    END IF;

    IF OLD.como_llego_lcp IS DISTINCT FROM NEW.como_llego_lcp THEN
      changed_fields_json := changed_fields_json || '{"como_llego_lcp": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('como_llego_lcp', OLD.como_llego_lcp);
      new_values_json := new_values_json || jsonb_build_object('como_llego_lcp', NEW.como_llego_lcp);
    END IF;

    IF OLD.telefono IS DISTINCT FROM NEW.telefono THEN
      changed_fields_json := changed_fields_json || '{"telefono": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('telefono', OLD.telefono);
      new_values_json := new_values_json || jsonb_build_object('telefono', NEW.telefono);
    END IF;

    IF OLD.grupo_economico IS DISTINCT FROM NEW.grupo_economico THEN
      changed_fields_json := changed_fields_json || '{"grupo_economico": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('grupo_economico', OLD.grupo_economico);
      new_values_json := new_values_json || jsonb_build_object('grupo_economico', NEW.grupo_economico);
    END IF;

    IF OLD.visita IS DISTINCT FROM NEW.visita THEN
      changed_fields_json := changed_fields_json || '{"visita": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('visita', OLD.visita);
      new_values_json := new_values_json || jsonb_build_object('visita', NEW.visita);
    END IF;

    IF OLD.status IS DISTINCT FROM NEW.status THEN
      changed_fields_json := changed_fields_json || '{"status": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('status', OLD.status);
      new_values_json := new_values_json || jsonb_build_object('status', NEW.status);
    END IF;

    IF OLD.descripcion_empresa IS DISTINCT FROM NEW.descripcion_empresa THEN
      changed_fields_json := changed_fields_json || '{"descripcion_empresa": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('descripcion_empresa', OLD.descripcion_empresa);
      new_values_json := new_values_json || jsonb_build_object('descripcion_empresa', NEW.descripcion_empresa);
    END IF;

    IF OLD.inicio_actividades IS DISTINCT FROM NEW.inicio_actividades THEN
      changed_fields_json := changed_fields_json || '{"inicio_actividades": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('inicio_actividades', OLD.inicio_actividades);
      new_values_json := new_values_json || jsonb_build_object('inicio_actividades', NEW.inicio_actividades);
    END IF;

    IF OLD.relacion_comercial_deudor IS DISTINCT FROM NEW.relacion_comercial_deudor THEN
      changed_fields_json := changed_fields_json || '{"relacion_comercial_deudor": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('relacion_comercial_deudor', OLD.relacion_comercial_deudor);
      new_values_json := new_values_json || jsonb_build_object('relacion_comercial_deudor', NEW.relacion_comercial_deudor);
    END IF;

    IF OLD.validado_por IS DISTINCT FROM NEW.validado_por THEN
      changed_fields_json := changed_fields_json || '{"validado_por": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('validado_por', OLD.validado_por);
      new_values_json := new_values_json || jsonb_build_object('validado_por', NEW.validado_por);
    END IF;

    IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
      changed_fields_json := changed_fields_json || '{"solicitud_id": true}'::jsonb;
      old_values_json := old_values_json || jsonb_build_object('solicitud_id', OLD.solicitud_id);
      new_values_json := new_values_json || jsonb_build_object('solicitud_id', NEW.solicitud_id);
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    old_values_json := to_jsonb(OLD);
  END IF;

  -- Insertar log solo si hay cambios (para UPDATE) o siempre (para INSERT/DELETE)
  IF TG_OP IN ('INSERT', 'DELETE') OR (TG_OP = 'UPDATE' AND changed_fields_json != '{}'::jsonb) THEN
    INSERT INTO public.rib_audit_log (
      rib_id,
      user_id,
      user_email,
      action,
      changed_fields,
      old_values,
      new_values
    ) VALUES (
      COALESCE(NEW.id, OLD.id),
      auth.uid(),
      current_user_email,
      action_type,
      changed_fields_json,
      old_values_json,
      new_values_json
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

