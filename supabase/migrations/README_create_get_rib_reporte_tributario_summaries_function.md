# Migración: Crear función get_rib_reporte_tributario_summaries

## Propósito
Crear una función SQL que devuelva un resumen de todos los reportes RIB tributarios con información de la empresa y el creador.

## Características
- Devuelve información consolidada de cada reporte RIB
- Incluye `nombre_empresa` de la tabla `rib_reporte_tributario` (para reportes manuales) o de `ficha_ruc`
- Incluye el nombre del creador desde la tabla `profiles`
- Filtra solo registros de tipo 'deudor' para evitar duplicados
- Ordena por fecha de actualización más reciente

## Ejecución
En el dashboard de Supabase:

1. Ve a SQL Editor
2. Copia y pega el contenido de `create_get_rib_reporte_tributario_summaries_function.sql`
3. Ejecuta la query

## Verificación
```sql
-- Prueba la función
SELECT * FROM get_rib_reporte_tributario_summaries();
```

## Rollback (si es necesario)
```sql
DROP FUNCTION IF EXISTS get_rib_reporte_tributario_summaries();
```

## Notas
- La función usa `COALESCE` para priorizar `nombre_empresa` de la tabla sobre el de `ficha_ruc`
- Esto permite que los reportes manuales muestren su nombre almacenado directamente
- Los reportes basados en Ficha RUC seguirán mostrando el nombre de `ficha_ruc`
- La función usa `DISTINCT ON` para evitar duplicados por múltiples años

