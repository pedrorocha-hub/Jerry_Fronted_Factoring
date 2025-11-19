# Migración: Agregar nombre_empresa a rib_reporte_tributario

## Propósito
Permitir la creación manual de reportes RIB tributarios sin necesidad de tener una Ficha RUC existente.

## Cambios
- Agrega columna `nombre_empresa` (TEXT) a la tabla `rib_reporte_tributario`

## Ejecución
En el dashboard de Supabase:

1. Ve a SQL Editor
2. Copia y pega el contenido de `add_nombre_empresa_to_rib_reporte_tributario.sql`
3. Ejecuta la query

## Verificación
```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rib_reporte_tributario' 
AND column_name = 'nombre_empresa';
```

## Rollback (si es necesario)
```sql
ALTER TABLE rib_reporte_tributario DROP COLUMN IF EXISTS nombre_empresa;
```

## Notas
- La columna es nullable para mantener compatibilidad con reportes existentes
- Los reportes manuales almacenarán el nombre de empresa directamente
- Los reportes basados en Ficha RUC seguirán usando la relación con `ficha_ruc`

