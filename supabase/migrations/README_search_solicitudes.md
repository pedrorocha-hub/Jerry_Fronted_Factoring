# Migración: Función search_solicitudes mejorada

## Descripción
Esta migración crea/actualiza la función `search_solicitudes` que permite buscar solicitudes de operación con información detallada incluyendo:
- Nombre de la empresa (de ficha_ruc o campo proveedor)
- RUC
- Estado de la solicitud
- Fecha de creación

## Cómo ejecutar

### Opción 1: Desde Supabase Dashboard
1. Ve a SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `create_search_solicitudes_function.sql`
3. Ejecuta la query

### Opción 2: Desde la CLI de Supabase
```bash
supabase db execute -f supabase/migrations/create_search_solicitudes_function.sql
```

### Opción 3: Manualmente con psql
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/migrations/create_search_solicitudes_function.sql
```

## Formato de resultados

La función devuelve:
```sql
{
  value: "id-de-la-solicitud",
  label: "NOMBRE EMPRESA • RUC: 12345678901 • Borrador • 20/10/2025"
}
```

## Búsqueda
La función busca en:
- RUC de la solicitud
- Nombre de empresa (de ficha_ruc)
- Campo proveedor (cuando no hay ficha_ruc)
- ID de la solicitud

## Límite
Retorna máximo 50 resultados, ordenados por fecha de creación (más recientes primero).

