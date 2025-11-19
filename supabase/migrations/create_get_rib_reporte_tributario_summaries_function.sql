-- Create or replace function to get RIB Reporte Tributario summaries
-- This function returns a summary list of all RIB reports with company names and creator info

DROP FUNCTION IF EXISTS get_rib_reporte_tributario_summaries();

CREATE OR REPLACE FUNCTION get_rib_reporte_tributario_summaries()
RETURNS TABLE (
  id UUID,
  deudor_ruc TEXT,
  deudor_nombre TEXT,
  proveedor_ruc TEXT,
  proveedor_nombre TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  creator_name TEXT,
  solicitud_id UUID,
  anio INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH deudor_data AS (
    SELECT 
      rrt.id,
      rrt.ruc as deudor_ruc,
      rrt.nombre_empresa as deudor_nombre_manual,
      rrt.updated_at,
      rrt.status,
      rrt.user_id,
      rrt.solicitud_id,
      rrt.anio,
      ROW_NUMBER() OVER (PARTITION BY rrt.id ORDER BY rrt.updated_at DESC, rrt.anio DESC) as rn
    FROM rib_reporte_tributario rrt
    WHERE rrt.tipo_entidad = 'deudor'
  ),
  proveedor_data AS (
    SELECT 
      rrt.id,
      rrt.ruc as proveedor_ruc,
      rrt.nombre_empresa as proveedor_nombre_manual,
      ROW_NUMBER() OVER (PARTITION BY rrt.id ORDER BY rrt.updated_at DESC, rrt.anio DESC) as rn
    FROM rib_reporte_tributario rrt
    WHERE rrt.tipo_entidad = 'proveedor'
  )
  SELECT 
    d.id,
    COALESCE(d.deudor_ruc, '')::TEXT as deudor_ruc,
    COALESCE(d.deudor_nombre_manual, fd.nombre_empresa, 'Sin información')::TEXT as deudor_nombre,
    COALESCE(prov.proveedor_ruc, 'N/A')::TEXT as proveedor_ruc,
    COALESCE(prov.proveedor_nombre_manual, fp.nombre_empresa, 'Sin proveedor')::TEXT as proveedor_nombre,
    d.updated_at,
    COALESCE(d.status, 'Borrador')::TEXT as status,
    COALESCE(p.full_name, 'Sistema')::TEXT as creator_name,
    d.solicitud_id,
    COALESCE(d.anio, 2024) as anio
  FROM deudor_data d
  LEFT JOIN proveedor_data prov ON d.id = prov.id AND prov.rn = 1
  LEFT JOIN ficha_ruc fd ON d.deudor_ruc = fd.ruc
  LEFT JOIN ficha_ruc fp ON prov.proveedor_ruc = fp.ruc
  LEFT JOIN profiles p ON d.user_id = p.id
  WHERE d.rn = 1
  ORDER BY d.updated_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_rib_reporte_tributario_summaries() TO authenticated;
GRANT EXECUTE ON FUNCTION get_rib_reporte_tributario_summaries() TO service_role;

COMMENT ON FUNCTION get_rib_reporte_tributario_summaries() IS 'Returns summary list of RIB Reporte Tributario reports with company info';

