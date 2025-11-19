-- Create or replace function to get Ventas Mensuales summaries
-- This function returns a summary list of all Ventas Mensuales reports grouped by proveedor_ruc and solicitud_id

DROP FUNCTION IF EXISTS get_ventas_mensuales_summaries();

CREATE OR REPLACE FUNCTION get_ventas_mensuales_summaries()
RETURNS TABLE (
  id TEXT,
  ruc TEXT,
  nombre_empresa TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  creator_name TEXT,
  solicitud_id UUID
) AS $$
BEGIN
  RETURN QUERY
  WITH ventas_grouped AS (
    SELECT 
      vm.proveedor_ruc || '_' || COALESCE(vm.solicitud_id::TEXT, 'null') as id,
      vm.proveedor_ruc as ruc,
      MAX(vm.updated_at) as last_updated_at,
      (ARRAY_AGG(vm.status ORDER BY vm.updated_at DESC))[1] as status,
      (ARRAY_AGG(vm.user_id ORDER BY vm.updated_at DESC))[1] as user_id,
      vm.solicitud_id
    FROM ventas_mensuales vm
    WHERE vm.tipo_entidad = 'proveedor'  -- Solo agrupar por proveedor para evitar duplicados
    GROUP BY vm.proveedor_ruc, vm.solicitud_id
  )
  SELECT 
    vg.id::TEXT,
    vg.ruc::TEXT,
    COALESCE(fr.nombre_empresa, 'Sin información')::TEXT as nombre_empresa,
    vg.last_updated_at,
    COALESCE(vg.status, 'borrador')::TEXT as status,
    COALESCE(p.full_name, 'Sistema')::TEXT as creator_name,
    vg.solicitud_id
  FROM ventas_grouped vg
  LEFT JOIN ficha_ruc fr ON vg.ruc = fr.ruc
  LEFT JOIN profiles p ON vg.user_id = p.id
  ORDER BY vg.last_updated_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_ventas_mensuales_summaries() TO authenticated;
GRANT EXECUTE ON FUNCTION get_ventas_mensuales_summaries() TO service_role;

COMMENT ON FUNCTION get_ventas_mensuales_summaries() IS 'Returns summary list of Ventas Mensuales reports grouped by proveedor_ruc and solicitud_id';

