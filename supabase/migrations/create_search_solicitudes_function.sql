-- Eliminar la función existente si existe
DROP FUNCTION IF EXISTS search_solicitudes(text);

-- Función mejorada para buscar solicitudes de operación con más detalles
CREATE OR REPLACE FUNCTION search_solicitudes(search_term TEXT)
RETURNS TABLE (
  value TEXT,
  label TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id::TEXT as value,
    CONCAT(
      COALESCE(f.nombre_empresa, s.proveedor, s.ruc), 
      ' • ', s.ruc,
      ' • ', COALESCE(s.status, 'Borrador'),
      ' • ', TO_CHAR(s.created_at, 'DD/MM/YYYY')
    ) as label
  FROM solicitudes_operacion s
  LEFT JOIN ficha_ruc f ON s.ruc = f.ruc
  WHERE 
    s.ruc ILIKE '%' || search_term || '%'
    OR LOWER(f.nombre_empresa) ILIKE '%' || LOWER(search_term) || '%'
    OR LOWER(s.proveedor) ILIKE '%' || LOWER(search_term) || '%'
    OR s.id::TEXT ILIKE '%' || search_term || '%'
  ORDER BY s.created_at DESC
  LIMIT 50;
END;
$$;

