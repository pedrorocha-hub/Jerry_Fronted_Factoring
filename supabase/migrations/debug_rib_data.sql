-- Query de diagnóstico para ver los datos de rib_reporte_tributario

-- Ver todos los registros agrupados por ID
SELECT 
    id,
    tipo_entidad,
    ruc,
    nombre_empresa,
    anio,
    status,
    updated_at
FROM rib_reporte_tributario
ORDER BY id, tipo_entidad, anio DESC;

-- Contar registros por tipo_entidad
SELECT 
    tipo_entidad,
    COUNT(*) as total
FROM rib_reporte_tributario
GROUP BY tipo_entidad;

-- Ver si hay registros con nombre_empresa NULL
SELECT 
    id,
    ruc,
    nombre_empresa,
    tipo_entidad
FROM rib_reporte_tributario
WHERE tipo_entidad = 'deudor'
LIMIT 10;

