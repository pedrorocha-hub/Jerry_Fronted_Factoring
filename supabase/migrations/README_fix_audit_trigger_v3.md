# Fix RIB Reporte Tributario Audit Trigger - Version 3

## Problema Identificado

El trigger de auditoría no está guardando los cambios en la tabla `rib_reporte_tributario_audit_log` cuando se hacen actualizaciones.

## Causas Posibles

1. **RETURN NULL incorrecto**: Aunque en triggers AFTER el valor de retorno se ignora, es mejor práctica retornar `NEW` o `OLD`
2. **Errores silenciosos**: Si hay un error en el trigger, puede fallar sin notificación
3. **Campos no monitoreados**: Puede que los campos que estás editando no estén en la lista de campos monitoreados

## Correcciones Aplicadas en V3

### 1. Retorno Correcto
- ✅ `RETURN NEW` para INSERT y UPDATE
- ✅ `RETURN OLD` para DELETE
- ✅ Manejo de errores con EXCEPTION que también retorna el registro apropiado

### 2. Campos Agregados
Se agregaron campos que faltaban a la lista de monitoreo:
- `ruc`
- `proveedor_ruc`

### 3. Manejo de Errores Mejorado
- Bloque `EXCEPTION WHEN OTHERS` en el loop de campos para no fallar si un campo no existe
- Bloque `EXCEPTION WHEN OTHERS` general para no interrumpir la operación si hay error en el trigger
- `RAISE WARNING` para logear errores sin fallar

### 4. Debug Opcionales
Se agregaron líneas de `RAISE NOTICE` comentadas que puedes activar para debugging:
```sql
-- RAISE NOTICE 'Trigger ejecutado: TG_OP=%, report_id=%, txid=%', TG_OP, v_report_id, v_txid;
```

## Instrucciones de Aplicación

### Paso 1: Aplicar la Migración

**En Supabase Dashboard:**
1. Ve a SQL Editor
2. Copia el contenido de `fix_rib_reporte_tributario_audit_trigger_v3.sql`
3. Ejecuta el script

**O usando CLI:**
```bash
supabase db push
```

### Paso 2: Verificar que se Aplicó

Ejecuta el script de debug:

```sql
-- Ver todos los triggers activos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'rib_reporte_tributario'
ORDER BY trigger_name;
```

Deberías ver:
```
trigger_name                           | event_manipulation | action_timing
---------------------------------------+--------------------+--------------
rib_reporte_tributario_audit_trigger  | UPDATE             | AFTER
```

### Paso 3: Hacer una Prueba

#### 3.1 Obtener un registro existente
```sql
SELECT 
    id,
    anio,
    tipo_entidad,
    ruc,
    status,
    cuentas_por_cobrar_giro
FROM public.rib_reporte_tributario
WHERE tipo_entidad = 'deudor'
LIMIT 1;
```

#### 3.2 Actualizar un campo monitorizado
```sql
UPDATE public.rib_reporte_tributario 
SET cuentas_por_cobrar_giro = COALESCE(cuentas_por_cobrar_giro, 0) + 1
WHERE id = 'EL_ID_QUE_OBTUVISTE'
  AND anio = EL_AÑO
  AND tipo_entidad = 'deudor';
```

#### 3.3 Verificar que se creó el log
```sql
SELECT 
    id,
    rib_reporte_tributario_id,
    user_full_name,
    action,
    changed_fields,
    old_values,
    new_values,
    created_at
FROM public.rib_reporte_tributario_audit_log
WHERE rib_reporte_tributario_id = 'EL_ID_QUE_USASTE'
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**
```json
{
  "id": "...",
  "action": "updated",
  "changed_fields": {"cuentas_por_cobrar_giro": true},
  "old_values": {
    "2024_deudor": {
      "cuentas_por_cobrar_giro": "1000",
      "anio": 2024,
      "tipo_entidad": "deudor"
    }
  },
  "new_values": {
    "2024_deudor": {
      "cuentas_por_cobrar_giro": "1001",
      "anio": 2024,
      "tipo_entidad": "deudor"
    }
  }
}
```

### Paso 4: Si NO Funciona - Activar Debug

1. Edita la función y descomenta las líneas de `RAISE NOTICE`:

```sql
CREATE OR REPLACE FUNCTION public.log_rib_reporte_tributario_changes()
RETURNS TRIGGER AS $$
DECLARE
    -- ... declaraciones ...
BEGIN
    -- Activar esta línea:
    RAISE NOTICE 'Trigger ejecutado: TG_OP=%, report_id=%, txid=%', TG_OP, v_report_id, v_txid;
    
    -- ... resto del código ...
    
    -- Activar también:
    -- RAISE NOTICE 'Campo cambiado: % (% -> %)', v_field, v_old_value, v_new_value;
    -- RAISE NOTICE 'No hubo cambios en campos monitoreados';
    -- RAISE NOTICE 'Creando nuevo log para usuario: %', v_user_full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. Ejecuta de nuevo el UPDATE
3. Los mensajes aparecerán en los logs de PostgreSQL

### Paso 5: Verificar Logs de PostgreSQL

En Supabase Dashboard:
1. Ve a "Database" → "Logs"
2. Selecciona "Postgres Logs"
3. Busca mensajes que contengan "Trigger ejecutado" o "Error en trigger"

## Troubleshooting

### Problema: No se crea ningún registro de audit

**Posibles causas:**

1. **El trigger no está activo**
   - Verificar con: `SELECT * FROM information_schema.triggers WHERE event_object_table = 'rib_reporte_tributario';`
   
2. **Los campos que editas no están monitoreados**
   - Revisa la lista `v_monitored_fields` en la función
   - Agrega los campos necesarios si faltan

3. **Error en el trigger que se está tragando**
   - Activa los `RAISE NOTICE` para ver qué pasa
   - Revisa los logs de PostgreSQL

4. **Permisos insuficientes**
   - La función usa `SECURITY DEFINER`, debería funcionar
   - Verifica que la tabla `rib_reporte_tributario_audit_log` existe y es accesible

### Problema: Se crean registros pero los valores están vacíos

**Posible causa**: Los nombres de campos no coinciden

**Solución**: Verifica que los nombres en `v_monitored_fields` coinciden exactamente con los nombres de columnas en la tabla:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'rib_reporte_tributario'
ORDER BY ordinal_position;
```

## Campos Monitoreados (Lista Completa)

```
- ruc
- proveedor_ruc
- nombre_empresa
- status
- solicitud_id
- cuentas_por_cobrar_giro
- total_activos
- cuentas_por_pagar_giro
- total_pasivos
- capital_pagado
- total_patrimonio
- total_pasivo_patrimonio
- ingreso_ventas
- utilidad_bruta
- utilidad_antes_impuesto
- solvencia
- gestion
```

Si necesitas monitorear otros campos, agrégalos al array `v_monitored_fields` en la función.

## Rollback

Si necesitas volver atrás:

```sql
DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_trigger ON public.rib_reporte_tributario CASCADE;
DROP FUNCTION IF EXISTS public.log_rib_reporte_tributario_changes() CASCADE;
```

Luego re-aplica la versión anterior si es necesario.

