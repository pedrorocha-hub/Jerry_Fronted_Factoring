# Migración: Actualizar Trigger de Auditoría para RIB Reporte Tributario

## Propósito
Actualizar el trigger de auditoría de `rib_reporte_tributario` para incluir el tracking del campo `nombre_empresa` y mejorar el manejo de errores.

## Cambios Principales

### 1. Inclusión de nombre_empresa
- El trigger ahora detecta y registra cambios en el campo `nombre_empresa`
- Se agrega `nombre_empresa` a la lista de campos monitoreados

### 2. Mejoras en el Tracking de Cambios
- Mejor identificación de campos modificados
- `changed_fields` ahora incluye cada campo que cambió
- Agregación correcta cuando múltiples registros cambian en la misma transacción

### 3. Manejo de Errores
- Try-catch para obtención de usuario JWT
- Fallback a 'Sistema' si no hay usuario autenticado
- Protección contra errores en auth.jwt()

### 4. Tipos Correctos
- `report_id` como TEXT (compatible con UUID)
- Conversión correcta de tipos en todas las operaciones

## Estructura del Trigger

### Flujo de Operación
1. **Obtiene valores comunes**: transaction_id, report_id, key_name
2. **Verifica log existente**: Busca si ya hay un log para esta transacción
3. **Si existe log**: Agrega cambios al log existente (agregación)
4. **Si no existe**: Crea nuevo log con toda la información

### Campos Monitoreados
- `ruc`
- `nombre_empresa` ⭐ (nuevo)
- `anio`
- `tipo_entidad`
- `solicitud_id`
- `cuentas_por_cobrar_giro`
- `total_activos`
- `cuentas_por_pagar_giro`
- `total_pasivos`
- `capital_pagado`
- `total_patrimonio`
- `total_pasivo_patrimonio`
- `ingreso_ventas`
- `utilidad_bruta`
- `utilidad_antes_impuesto`
- `solvencia`
- `gestion`
- `status`

## Ejecución

### En Supabase Dashboard:
1. Ve a **SQL Editor**
2. Copia y pega el contenido de `update_rib_reporte_tributario_audit_trigger_add_nombre_empresa.sql`
3. Ejecuta la query

### Orden de Ejecución
Este trigger debe ejecutarse **DESPUÉS** de:
- `add_nombre_empresa_to_rib_reporte_tributario.sql` (columna debe existir primero)

## Verificación

### 1. Verificar que el trigger existe:
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'rib_reporte_tributario_audit_trigger';
```

### 2. Verificar que la función existe:
```sql
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'log_rib_reporte_tributario_changes';
```

### 3. Probar el trigger:
```sql
-- Crear un reporte de prueba
INSERT INTO rib_reporte_tributario (
  id, ruc, nombre_empresa, anio, tipo_entidad, status
) VALUES (
  gen_random_uuid(), '12345678901', 'Empresa de Prueba', 2024, 'deudor', 'Borrador'
);

-- Verificar que se creó el log
SELECT * FROM rib_reporte_tributario_audit_log
ORDER BY created_at DESC
LIMIT 1;

-- Actualizar el nombre de empresa
UPDATE rib_reporte_tributario
SET nombre_empresa = 'Empresa Actualizada'
WHERE ruc = '12345678901';

-- Verificar que se registró el cambio
SELECT 
  user_full_name,
  action,
  changed_fields,
  old_values->>'2024_deudor'->>'nombre_empresa' as old_nombre,
  new_values->>'2024_deudor'->>'nombre_empresa' as new_nombre
FROM rib_reporte_tributario_audit_log
WHERE rib_reporte_tributario_id IN (
  SELECT id FROM rib_reporte_tributario WHERE ruc = '12345678901'
)
ORDER BY created_at DESC
LIMIT 1;

-- Limpiar datos de prueba
DELETE FROM rib_reporte_tributario WHERE ruc = '12345678901';
```

## Rollback (si es necesario)

```sql
-- Eliminar trigger y función
DROP TRIGGER IF EXISTS rib_reporte_tributario_audit_trigger ON public.rib_reporte_tributario;
DROP FUNCTION IF EXISTS public.log_rib_reporte_tributario_changes();

-- Opcional: recrear versión anterior si existe backup
```

## Comportamiento del Trigger

### INSERT
- Registra todos los valores nuevos
- `old_values` = `{}`
- `new_values` = datos completos del registro
- `action` = 'updated' (por convención del sistema)
- `changed_fields` contiene `{"action": "insert"}`

### UPDATE
- Registra valores antes y después
- `old_values` = datos antes del cambio
- `new_values` = datos después del cambio
- `changed_fields` = objeto con cada campo modificado marcado como `true`
- Incluye `nombre_empresa` si cambió

### DELETE
- Registra valores eliminados
- `old_values` = datos del registro eliminado
- `new_values` = `{}`
- `changed_fields` contiene `{"action": "delete"}`

### Agregación (Múltiples cambios en misma transacción)
Cuando se modifican múltiples registros del mismo reporte (diferentes años o entidades) en la misma transacción:
- Se crea UN solo log entry
- Los cambios se agregan bajo diferentes keys: `"2022_deudor"`, `"2023_deudor"`, `"2024_proveedor"`, etc.
- `changed_fields` acumula todos los campos modificados

## Notas Importantes

### Seguridad
- Función usa `SECURITY DEFINER` para acceder a `auth.jwt()`
- Protección con try-catch para errores de autenticación
- Fallback a 'Sistema' si no hay usuario

### Performance
- Trigger se ejecuta AFTER (no bloquea la operación principal)
- Agregación reduce número de registros en audit log
- Índices en `rib_reporte_tributario_audit_log(rib_reporte_tributario_id, transaction_id)` recomendados

### Limitaciones
- Solo detecta cambios a nivel de base de datos
- No captura quién inició cambios desde APIs externas sin autenticación
- Transaction ID es único por transacción, no por sesión

## Ejemplo de Output en Audit Log

```json
{
  "rib_reporte_tributario_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_full_name": "Juan Pérez",
  "action": "updated",
  "changed_fields": {
    "nombre_empresa": true,
    "total_activos": true,
    "action": "update"
  },
  "old_values": {
    "2024_deudor": {
      "nombre_empresa": "Empresa Vieja S.A.",
      "total_activos": 1000000
    }
  },
  "new_values": {
    "2024_deudor": {
      "nombre_empresa": "Empresa Nueva S.A.C.",
      "total_activos": 1500000
    }
  }
}
```

## Troubleshooting

### Problema: Trigger no se activa
```sql
-- Verificar que el trigger está habilitado
SELECT * FROM pg_trigger 
WHERE tgname = 'rib_reporte_tributario_audit_trigger';
```

### Problema: Errores de permisos
```sql
-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT EXECUTE ON FUNCTION auth.jwt() TO postgres;
```

### Problema: Usuario aparece como 'Sistema'
- Verificar que la sesión tiene JWT válido
- Comprobar que el usuario está en la tabla `profiles`

