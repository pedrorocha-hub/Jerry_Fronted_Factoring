# Migración: Agregar campo nombre_empresa a tabla rib

## Descripción
Esta migración agrega el campo `nombre_empresa` a la tabla `rib` para almacenar el nombre de la empresa cuando se crean RIBs manualmente sin una ficha RUC asociada.

## Por qué es necesario
Cuando se crea un RIB manualmente (sin buscar primero en ficha_ruc), necesitamos almacenar el nombre de la empresa directamente en la tabla rib para poder mostrarlo en la lista de RIBs.

## Cómo ejecutar

### Opción 1: Desde Supabase Dashboard
1. Ve a SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `add_nombre_empresa_to_rib.sql`
3. Ejecuta la query

### Opción 2: Desde la CLI de Supabase
```bash
supabase db execute -f supabase/migrations/add_nombre_empresa_to_rib.sql
```

### Opción 3: Manualmente con psql
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/migrations/add_nombre_empresa_to_rib.sql
```

## Cambios en el código

Después de ejecutar esta migración, el sistema:
- Guarda el `nombre_empresa` cuando se crea/actualiza un RIB en modo manual
- Muestra el `nombre_empresa` almacenado en la tabla rib cuando no hay ficha_ruc
- Prioriza `rib.nombre_empresa` sobre la búsqueda en `ficha_ruc.nombre_empresa`

## Compatibilidad

Esta migración es **retrocompatible**:
- RIBs existentes con ficha_ruc: seguirán mostrando el nombre desde ficha_ruc
- RIBs existentes sin ficha_ruc: tendrán `nombre_empresa` NULL, se mostrará "Razón Social no encontrada"
- RIBs nuevos sin ficha_ruc: guardarán el nombre ingresado manualmente

