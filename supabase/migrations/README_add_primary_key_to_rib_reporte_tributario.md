# Migración: Agregar Primary Key a rib_reporte_tributario

## Propósito
Agregar una clave primaria compuesta a la tabla `rib_reporte_tributario` para permitir operaciones de UPDATE y DELETE desde la interfaz de Supabase.

## Problema
Sin una PRIMARY KEY definida, Supabase no permite editar o eliminar registros desde la UI porque no puede identificar de manera única cada fila.

## Solución
Se agrega una PRIMARY KEY compuesta de tres columnas:
- `id` - Identifica el reporte
- `anio` - Año de los datos (2022, 2023, 2024)
- `tipo_entidad` - Tipo de entidad ('deudor' o 'proveedor')

## Por qué esta combinación

### Ejemplo de datos:
```
id                  | anio | tipo_entidad | ruc
--------------------|------|--------------|-------------
abc-123             | 2024 | deudor       | 20123456789
abc-123             | 2023 | deudor       | 20123456789
abc-123             | 2024 | proveedor    | 20987654321
abc-123             | 2023 | proveedor    | 20987654321
```

Cada combinación es **única**:
- ✅ (abc-123, 2024, deudor) - único
- ✅ (abc-123, 2023, deudor) - único
- ✅ (abc-123, 2024, proveedor) - único
- ✅ (abc-123, 2023, proveedor) - único

## Ejecución

### En Supabase Dashboard:
1. Ve a **SQL Editor**
2. Copia y pega el contenido de `add_primary_key_to_rib_reporte_tributario.sql`
3. Ejecuta la query

## Verificación

```sql
-- Ver la constraint de primary key
SELECT 
    tc.constraint_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'rib_reporte_tributario'
    AND tc.constraint_type = 'PRIMARY KEY';
```

Debería retornar:
```
constraint_name                    | column_name    | constraint_type
----------------------------------|----------------|----------------
rib_reporte_tributario_pkey       | id             | PRIMARY KEY
rib_reporte_tributario_pkey       | anio           | PRIMARY KEY
rib_reporte_tributario_pkey       | tipo_entidad   | PRIMARY KEY
```

## Beneficios

1. ✅ **Permite UPDATE/DELETE desde Supabase UI**: Ya no verás el error "Add a primary key column"
2. ✅ **Garantiza unicidad**: No se pueden crear registros duplicados
3. ✅ **Mejora performance**: Los índices de primary key aceleran las búsquedas
4. ✅ **Compatibilidad con UPSERT**: El `onConflict` en el código ya usa esta combinación

## Compatibilidad con el Código

El servicio TypeScript ya usa esta misma constraint en el UPSERT:
```typescript
.upsert(allRecords, {
  onConflict: 'id,anio,tipo_entidad',  // ✅ Coincide con la PRIMARY KEY
  ignoreDuplicates: false
})
```

## Rollback (si es necesario)

```sql
-- Eliminar la primary key
ALTER TABLE rib_reporte_tributario DROP CONSTRAINT IF EXISTS rib_reporte_tributario_pkey;
```

**⚠️ Advertencia**: Sin primary key, no podrás editar/eliminar registros desde Supabase UI.

## Notas Importantes

- La migración es **idempotente**: Puede ejecutarse múltiples veces sin error
- No afecta los datos existentes
- Si ya existe una primary key diferente, se eliminará y reemplazará
- Esta constraint debe ejecutarse **antes** de usar la UI de Supabase para editar datos

