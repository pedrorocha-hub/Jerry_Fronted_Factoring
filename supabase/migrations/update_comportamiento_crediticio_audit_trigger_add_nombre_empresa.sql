-- Actualizar el trigger de auditoría para comportamiento_crediticio
-- para incluir el nuevo campo nombre_empresa

-- Primero, eliminar el trigger y la función existentes
DROP TRIGGER IF EXISTS comportamiento_crediticio_audit_trigger ON comportamiento_crediticio;
DROP FUNCTION IF EXISTS log_comportamiento_crediticio_changes();

-- Recrear la función con el campo nombre_empresa incluido
CREATE OR REPLACE FUNCTION log_comportamiento_crediticio_changes()
RETURNS TRIGGER AS $$
DECLARE
  change_type TEXT;
  changed_fields JSONB := '{}'::jsonb;
  old_values JSONB := '{}'::jsonb;
  new_values JSONB := '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    change_type := 'INSERT';
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    change_type := 'UPDATE';
    
    -- Comparar cada campo y registrar cambios
    IF OLD.ruc IS DISTINCT FROM NEW.ruc THEN
      old_values := old_values || jsonb_build_object('ruc', OLD.ruc);
      new_values := new_values || jsonb_build_object('ruc', NEW.ruc);
      changed_fields := changed_fields || jsonb_build_array('ruc');
    END IF;

    IF OLD.nombre_empresa IS DISTINCT FROM NEW.nombre_empresa THEN
      old_values := old_values || jsonb_build_object('nombre_empresa', OLD.nombre_empresa);
      new_values := new_values || jsonb_build_object('nombre_empresa', NEW.nombre_empresa);
      changed_fields := changed_fields || jsonb_build_array('nombre_empresa');
    END IF;

    IF OLD.proveedor IS DISTINCT FROM NEW.proveedor THEN
      old_values := old_values || jsonb_build_object('proveedor', OLD.proveedor);
      new_values := new_values || jsonb_build_object('proveedor', NEW.proveedor);
      changed_fields := changed_fields || jsonb_build_array('proveedor');
    END IF;

    IF OLD.solicitud_id IS DISTINCT FROM NEW.solicitud_id THEN
      old_values := old_values || jsonb_build_object('solicitud_id', OLD.solicitud_id);
      new_values := new_values || jsonb_build_object('solicitud_id', NEW.solicitud_id);
      changed_fields := changed_fields || jsonb_build_array('solicitud_id');
    END IF;

    IF OLD.status IS DISTINCT FROM NEW.status THEN
      old_values := old_values || jsonb_build_object('status', OLD.status);
      new_values := new_values || jsonb_build_object('status', NEW.status);
      changed_fields := changed_fields || jsonb_build_array('status');
    END IF;

    IF OLD.equifax_score IS DISTINCT FROM NEW.equifax_score THEN
      old_values := old_values || jsonb_build_object('equifax_score', OLD.equifax_score);
      new_values := new_values || jsonb_build_object('equifax_score', NEW.equifax_score);
      changed_fields := changed_fields || jsonb_build_array('equifax_score');
    END IF;

    IF OLD.sentinel_score IS DISTINCT FROM NEW.sentinel_score THEN
      old_values := old_values || jsonb_build_object('sentinel_score', OLD.sentinel_score);
      new_values := new_values || jsonb_build_object('sentinel_score', NEW.sentinel_score);
      changed_fields := changed_fields || jsonb_build_array('sentinel_score');
    END IF;

    IF OLD.equifax_calificacion IS DISTINCT FROM NEW.equifax_calificacion THEN
      old_values := old_values || jsonb_build_object('equifax_calificacion', OLD.equifax_calificacion);
      new_values := new_values || jsonb_build_object('equifax_calificacion', NEW.equifax_calificacion);
      changed_fields := changed_fields || jsonb_build_array('equifax_calificacion');
    END IF;

    IF OLD.sentinel_calificacion IS DISTINCT FROM NEW.sentinel_calificacion THEN
      old_values := old_values || jsonb_build_object('sentinel_calificacion', OLD.sentinel_calificacion);
      new_values := new_values || jsonb_build_object('sentinel_calificacion', NEW.sentinel_calificacion);
      changed_fields := changed_fields || jsonb_build_array('sentinel_calificacion');
    END IF;

    IF OLD.equifax_deuda_directa IS DISTINCT FROM NEW.equifax_deuda_directa THEN
      old_values := old_values || jsonb_build_object('equifax_deuda_directa', OLD.equifax_deuda_directa);
      new_values := new_values || jsonb_build_object('equifax_deuda_directa', NEW.equifax_deuda_directa);
      changed_fields := changed_fields || jsonb_build_array('equifax_deuda_directa');
    END IF;

    IF OLD.sentinel_deuda_directa IS DISTINCT FROM NEW.sentinel_deuda_directa THEN
      old_values := old_values || jsonb_build_object('sentinel_deuda_directa', OLD.sentinel_deuda_directa);
      new_values := new_values || jsonb_build_object('sentinel_deuda_directa', NEW.sentinel_deuda_directa);
      changed_fields := changed_fields || jsonb_build_array('sentinel_deuda_directa');
    END IF;

    IF OLD.equifax_deuda_indirecta IS DISTINCT FROM NEW.equifax_deuda_indirecta THEN
      old_values := old_values || jsonb_build_object('equifax_deuda_indirecta', OLD.equifax_deuda_indirecta);
      new_values := new_values || jsonb_build_object('equifax_deuda_indirecta', NEW.equifax_deuda_indirecta);
      changed_fields := changed_fields || jsonb_build_array('equifax_deuda_indirecta');
    END IF;

    IF OLD.sentinel_deuda_indirecta IS DISTINCT FROM NEW.sentinel_deuda_indirecta THEN
      old_values := old_values || jsonb_build_object('sentinel_deuda_indirecta', OLD.sentinel_deuda_indirecta);
      new_values := new_values || jsonb_build_object('sentinel_deuda_indirecta', NEW.sentinel_deuda_indirecta);
      changed_fields := changed_fields || jsonb_build_array('sentinel_deuda_indirecta');
    END IF;

    IF OLD.equifax_impagos IS DISTINCT FROM NEW.equifax_impagos THEN
      old_values := old_values || jsonb_build_object('equifax_impagos', OLD.equifax_impagos);
      new_values := new_values || jsonb_build_object('equifax_impagos', NEW.equifax_impagos);
      changed_fields := changed_fields || jsonb_build_array('equifax_impagos');
    END IF;

    IF OLD.sentinel_impagos IS DISTINCT FROM NEW.sentinel_impagos THEN
      old_values := old_values || jsonb_build_object('sentinel_impagos', OLD.sentinel_impagos);
      new_values := new_values || jsonb_build_object('sentinel_impagos', NEW.sentinel_impagos);
      changed_fields := changed_fields || jsonb_build_array('sentinel_impagos');
    END IF;

    IF OLD.equifax_deuda_sunat IS DISTINCT FROM NEW.equifax_deuda_sunat THEN
      old_values := old_values || jsonb_build_object('equifax_deuda_sunat', OLD.equifax_deuda_sunat);
      new_values := new_values || jsonb_build_object('equifax_deuda_sunat', NEW.equifax_deuda_sunat);
      changed_fields := changed_fields || jsonb_build_array('equifax_deuda_sunat');
    END IF;

    IF OLD.sentinel_deuda_sunat IS DISTINCT FROM NEW.sentinel_deuda_sunat THEN
      old_values := old_values || jsonb_build_object('sentinel_deuda_sunat', OLD.sentinel_deuda_sunat);
      new_values := new_values || jsonb_build_object('sentinel_deuda_sunat', NEW.sentinel_deuda_sunat);
      changed_fields := changed_fields || jsonb_build_array('sentinel_deuda_sunat');
    END IF;

    IF OLD.equifax_protestos IS DISTINCT FROM NEW.equifax_protestos THEN
      old_values := old_values || jsonb_build_object('equifax_protestos', OLD.equifax_protestos);
      new_values := new_values || jsonb_build_object('equifax_protestos', NEW.equifax_protestos);
      changed_fields := changed_fields || jsonb_build_array('equifax_protestos');
    END IF;

    IF OLD.sentinel_protestos IS DISTINCT FROM NEW.sentinel_protestos THEN
      old_values := old_values || jsonb_build_object('sentinel_protestos', OLD.sentinel_protestos);
      new_values := new_values || jsonb_build_object('sentinel_protestos', NEW.sentinel_protestos);
      changed_fields := changed_fields || jsonb_build_array('sentinel_protestos');
    END IF;

    IF OLD.validado_por IS DISTINCT FROM NEW.validado_por THEN
      old_values := old_values || jsonb_build_object('validado_por', OLD.validado_por);
      new_values := new_values || jsonb_build_object('validado_por', NEW.validado_por);
      changed_fields := changed_fields || jsonb_build_array('validado_por');
    END IF;

    IF OLD.apefac_descripcion IS DISTINCT FROM NEW.apefac_descripcion THEN
      old_values := old_values || jsonb_build_object('apefac_descripcion', OLD.apefac_descripcion);
      new_values := new_values || jsonb_build_object('apefac_descripcion', NEW.apefac_descripcion);
      changed_fields := changed_fields || jsonb_build_array('apefac_descripcion');
    END IF;

    IF OLD.comentarios IS DISTINCT FROM NEW.comentarios THEN
      old_values := old_values || jsonb_build_object('comentarios', OLD.comentarios);
      new_values := new_values || jsonb_build_object('comentarios', NEW.comentarios);
      changed_fields := changed_fields || jsonb_build_array('comentarios');
    END IF;

    -- Campos del Deudor
    IF OLD.deudor IS DISTINCT FROM NEW.deudor THEN
      old_values := old_values || jsonb_build_object('deudor', OLD.deudor);
      new_values := new_values || jsonb_build_object('deudor', NEW.deudor);
      changed_fields := changed_fields || jsonb_build_array('deudor');
    END IF;

    IF OLD.deudor_equifax_score IS DISTINCT FROM NEW.deudor_equifax_score THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_score', OLD.deudor_equifax_score);
      new_values := new_values || jsonb_build_object('deudor_equifax_score', NEW.deudor_equifax_score);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_score');
    END IF;

    IF OLD.deudor_sentinel_score IS DISTINCT FROM NEW.deudor_sentinel_score THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_score', OLD.deudor_sentinel_score);
      new_values := new_values || jsonb_build_object('deudor_sentinel_score', NEW.deudor_sentinel_score);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_score');
    END IF;

    IF OLD.deudor_equifax_calificacion IS DISTINCT FROM NEW.deudor_equifax_calificacion THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_calificacion', OLD.deudor_equifax_calificacion);
      new_values := new_values || jsonb_build_object('deudor_equifax_calificacion', NEW.deudor_equifax_calificacion);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_calificacion');
    END IF;

    IF OLD.deudor_sentinel_calificacion IS DISTINCT FROM NEW.deudor_sentinel_calificacion THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_calificacion', OLD.deudor_sentinel_calificacion);
      new_values := new_values || jsonb_build_object('deudor_sentinel_calificacion', NEW.deudor_sentinel_calificacion);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_calificacion');
    END IF;

    IF OLD.deudor_equifax_deuda_directa IS DISTINCT FROM NEW.deudor_equifax_deuda_directa THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_deuda_directa', OLD.deudor_equifax_deuda_directa);
      new_values := new_values || jsonb_build_object('deudor_equifax_deuda_directa', NEW.deudor_equifax_deuda_directa);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_deuda_directa');
    END IF;

    IF OLD.deudor_sentinel_deuda_directa IS DISTINCT FROM NEW.deudor_sentinel_deuda_directa THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_deuda_directa', OLD.deudor_sentinel_deuda_directa);
      new_values := new_values || jsonb_build_object('deudor_sentinel_deuda_directa', NEW.deudor_sentinel_deuda_directa);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_deuda_directa');
    END IF;

    IF OLD.deudor_equifax_deuda_indirecta IS DISTINCT FROM NEW.deudor_equifax_deuda_indirecta THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_deuda_indirecta', OLD.deudor_equifax_deuda_indirecta);
      new_values := new_values || jsonb_build_object('deudor_equifax_deuda_indirecta', NEW.deudor_equifax_deuda_indirecta);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_deuda_indirecta');
    END IF;

    IF OLD.deudor_sentinel_deuda_indirecta IS DISTINCT FROM NEW.deudor_sentinel_deuda_indirecta THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_deuda_indirecta', OLD.deudor_sentinel_deuda_indirecta);
      new_values := new_values || jsonb_build_object('deudor_sentinel_deuda_indirecta', NEW.deudor_sentinel_deuda_indirecta);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_deuda_indirecta');
    END IF;

    IF OLD.deudor_equifax_impagos IS DISTINCT FROM NEW.deudor_equifax_impagos THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_impagos', OLD.deudor_equifax_impagos);
      new_values := new_values || jsonb_build_object('deudor_equifax_impagos', NEW.deudor_equifax_impagos);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_impagos');
    END IF;

    IF OLD.deudor_sentinel_impagos IS DISTINCT FROM NEW.deudor_sentinel_impagos THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_impagos', OLD.deudor_sentinel_impagos);
      new_values := new_values || jsonb_build_object('deudor_sentinel_impagos', NEW.deudor_sentinel_impagos);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_impagos');
    END IF;

    IF OLD.deudor_equifax_deuda_sunat IS DISTINCT FROM NEW.deudor_equifax_deuda_sunat THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_deuda_sunat', OLD.deudor_equifax_deuda_sunat);
      new_values := new_values || jsonb_build_object('deudor_equifax_deuda_sunat', NEW.deudor_equifax_deuda_sunat);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_deuda_sunat');
    END IF;

    IF OLD.deudor_sentinel_deuda_sunat IS DISTINCT FROM NEW.deudor_sentinel_deuda_sunat THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_deuda_sunat', OLD.deudor_sentinel_deuda_sunat);
      new_values := new_values || jsonb_build_object('deudor_sentinel_deuda_sunat', NEW.deudor_sentinel_deuda_sunat);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_deuda_sunat');
    END IF;

    IF OLD.deudor_equifax_protestos IS DISTINCT FROM NEW.deudor_equifax_protestos THEN
      old_values := old_values || jsonb_build_object('deudor_equifax_protestos', OLD.deudor_equifax_protestos);
      new_values := new_values || jsonb_build_object('deudor_equifax_protestos', NEW.deudor_equifax_protestos);
      changed_fields := changed_fields || jsonb_build_array('deudor_equifax_protestos');
    END IF;

    IF OLD.deudor_sentinel_protestos IS DISTINCT FROM NEW.deudor_sentinel_protestos THEN
      old_values := old_values || jsonb_build_object('deudor_sentinel_protestos', OLD.deudor_sentinel_protestos);
      new_values := new_values || jsonb_build_object('deudor_sentinel_protestos', NEW.deudor_sentinel_protestos);
      changed_fields := changed_fields || jsonb_build_array('deudor_sentinel_protestos');
    END IF;

    IF OLD.deudor_apefac_descripcion IS DISTINCT FROM NEW.deudor_apefac_descripcion THEN
      old_values := old_values || jsonb_build_object('deudor_apefac_descripcion', OLD.deudor_apefac_descripcion);
      new_values := new_values || jsonb_build_object('deudor_apefac_descripcion', NEW.deudor_apefac_descripcion);
      changed_fields := changed_fields || jsonb_build_array('deudor_apefac_descripcion');
    END IF;

    IF OLD.deudor_comentarios IS DISTINCT FROM NEW.deudor_comentarios THEN
      old_values := old_values || jsonb_build_object('deudor_comentarios', OLD.deudor_comentarios);
      new_values := new_values || jsonb_build_object('deudor_comentarios', NEW.deudor_comentarios);
      changed_fields := changed_fields || jsonb_build_array('deudor_comentarios');
    END IF;

    -- Si no hay cambios en ningún campo, no registrar
    IF jsonb_array_length(changed_fields) = 0 THEN
      RETURN NEW;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    change_type := 'DELETE';
    old_values := to_jsonb(OLD);
  END IF;

  -- Insertar el registro de auditoría
  INSERT INTO comportamiento_crediticio_audit_log (
    comportamiento_crediticio_id,
    change_type,
    changed_fields,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    change_type,
    changed_fields,
    old_values,
    new_values,
    COALESCE(NEW.user_id, OLD.user_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger
CREATE TRIGGER comportamiento_crediticio_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comportamiento_crediticio
  FOR EACH ROW
  EXECUTE FUNCTION log_comportamiento_crediticio_changes();

-- Comentario explicativo
COMMENT ON FUNCTION log_comportamiento_crediticio_changes() IS 'Función actualizada para incluir el campo nombre_empresa en el registro de auditoría de comportamiento_crediticio';

