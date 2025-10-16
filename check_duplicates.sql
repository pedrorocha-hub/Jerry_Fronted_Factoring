-- Ver cuántos registros DUPLICADOS se están creando
SELECT 
    proveedor_ruc,
    COALESCE(deudor_ruc, 'NULL') as deudor_ruc,
    anio,
    tipo_entidad,
    solicitud_id,
    COUNT(*) as cantidad,
    array_agg(id ORDER BY created_at DESC) as ids,
    array_agg(created_at ORDER BY created_at DESC) as fechas
FROM ventas_mensuales
WHERE proveedor_ruc = '20556964620'
  AND solicitud_id = 'be4a56b3-ccec-485a-b005-673dabafb362'
GROUP BY proveedor_ruc, deudor_ruc, anio, tipo_entidad, solicitud_id
ORDER BY anio DESC;
