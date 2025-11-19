-- Create or replace function to get RIB EEFF summaries
-- This function returns a summary list of all RIB EEFF reports with proveedor, deudor and solicitud info

DROP FUNCTION IF EXISTS get_rib_eeff_summaries();

CREATE OR REPLACE FUNCTION get_rib_eeff_summaries()
RETURNS TABLE (
  id UUID,
  proveedor_ruc TEXT,
  proveedor_nombre TEXT,
  deudor_ruc TEXT,
  deudor_nombre TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  creator_name TEXT,
  solicitud_id UUID,
  solicitud_label TEXT,
  años_reportados TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH proveedor_data AS (
    SELECT 
      re.id,
      re.ruc as proveedor_ruc,
      COALESCE(fr_prov.nombre_empresa, 'Sin información')::TEXT as proveedor_nombre,
      MAX(re.updated_at) as updated_at,
      (ARRAY_AGG(re.status ORDER BY re.updated_at DESC))[1] as status,
      (ARRAY_AGG(re.user_id ORDER BY re.updated_at DESC))[1] as user_id,
      re.solicitud_id,
      ARRAY_AGG(DISTINCT re.anio_reporte ORDER BY re.anio_reporte DESC) as años
    FROM rib_eeff re
    LEFT JOIN ficha_ruc fr_prov ON re.ruc = fr_prov.ruc
    WHERE re.tipo_entidad = 'proveedor'
    GROUP BY re.id, re.ruc, fr_prov.nombre_empresa, re.solicitud_id
  ),
  deudor_data AS (
    SELECT 
      re.id,
      re.ruc as deudor_ruc,
      COALESCE(fr_deud.nombre_empresa, 'Sin información')::TEXT as deudor_nombre
    FROM rib_eeff re
    LEFT JOIN ficha_ruc fr_deud ON re.ruc = fr_deud.ruc
    WHERE re.tipo_entidad = 'deudor'
    GROUP BY re.id, re.ruc, fr_deud.nombre_empresa
  ),
  solicitud_info AS (
    SELECT 
      so.id as solicitud_id,
      CONCAT(
        COALESCE(fr_sol.nombre_empresa, so.ruc),
        ' - ',
        TO_CHAR(so.created_at, 'DD/MM/YYYY')
      ) as solicitud_label
    FROM solicitudes_operacion so
    LEFT JOIN ficha_ruc fr_sol ON so.ruc = fr_sol.ruc
  )
  SELECT 
    p.id,
    p.proveedor_ruc,
    p.proveedor_nombre,
    COALESCE(d.deudor_ruc, 'N/A')::TEXT as deudor_ruc,
    COALESCE(d.deudor_nombre, 'Sin deudor')::TEXT as deudor_nombre,
    p.updated_at,
    COALESCE(p.status, 'Borrador')::TEXT as status,
    COALESCE(prof.full_name, 'Sistema')::TEXT as creator_name,
    p.solicitud_id,
    si.solicitud_label,
    COALESCE(
      ARRAY_TO_STRING(p.años, ', '),
      'Sin años'
    )::TEXT as años_reportados
  FROM proveedor_data p
  LEFT JOIN deudor_data d ON p.id = d.id
  LEFT JOIN profiles prof ON p.user_id = prof.id
  LEFT JOIN solicitud_info si ON p.solicitud_id = si.solicitud_id
  ORDER BY p.updated_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_rib_eeff_summaries() IS 
  'Returns a summary of RIB EEFF reports with proveedor, deudor, solicitud and creator information';

