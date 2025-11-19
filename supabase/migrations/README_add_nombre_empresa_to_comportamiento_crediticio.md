# Migración: Agregar campo nombre_empresa a comportamiento_crediticio

## Descripción
Esta migración agrega el campo `nombre_empresa` a la tabla `comportamiento_crediticio` para permitir la creación de reportes sin necesidad de tener una ficha RUC registrada previamente.

## Cambios
- Agrega columna `nombre_empresa` (TEXT, nullable) a la tabla `comportamiento_crediticio`
- Este campo se usará cuando se creen reportes manualmente sin ficha RUC asociada

## Instrucciones de Aplicación

### Opción 1: Usando el Dashboard de Supabase
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Navega a "SQL Editor" en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `add_nombre_empresa_to_comportamiento_crediticio.sql`
5. Ejecuta la query

### Opción 2: Usando Supabase CLI
```bash
supabase migration up
```

## Verificación
Para verificar que la migración se aplicó correctamente:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'comportamiento_crediticio' 
AND column_name = 'nombre_empresa';
```

Deberías ver:
- column_name: nombre_empresa
- data_type: text
- is_nullable: YES

## Rollback
Si necesitas revertir esta migración:

```sql
ALTER TABLE comportamiento_crediticio 
DROP COLUMN IF EXISTS nombre_empresa;
```

## Notas Importantes
- Esta columna es nullable para mantener compatibilidad con registros existentes
- Los registros existentes tendrán `nombre_empresa` en NULL y seguirán usando la relación con `ficha_ruc`
- Los nuevos registros creados manualmente usarán este campo para almacenar el nombre de la empresa

