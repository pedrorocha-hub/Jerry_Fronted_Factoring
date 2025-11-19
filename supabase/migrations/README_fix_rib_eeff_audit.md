# Fix RIB EEFF Audit Trigger

## Problema

El trigger de auditoría `log_rib_eeff_changes()` estaba guardando un objeto fijo `'{"aggregated": true}'::jsonb` en el campo `changed_fields`, lo que causaba que el historial de auditoría siempre mostrara:

```
CAMPOS MODIFICADOS:
  aggregated
  Anterior: N/A
  Nuevo: N/A
```

## Causa

En la línea del `INSERT` del trigger original:
```sql
INSERT INTO public.rib_eeff_audit_log (
  ...
  changed_fields, 
  ...
) VALUES (
  ...
  '{"aggregated": true}'::jsonb,  -- ❌ Valor fijo incorrecto
  ...
);
```

## Solución

La nueva versión del trigger:

1. **Detecta campos modificados dinámicamente**: Compara OLD y NEW para cada campo monitoreado
2. **Guarda solo campos cambiados**: En `UPDATE`, solo registra campos con valores diferentes
3. **Registra valores específicos**: Guarda el valor anterior y nuevo de cada campo
4. **Agrupa cambios por transacción**: Múltiples filas actualizadas en una transacción se agrupan en un solo log

### Campos Monitoreados

- Campos básicos: `ruc`, `tipo_entidad`, `anio_reporte`, `status`, `solicitud_id`
- Activos: Caja, cuentas por cobrar, existencias, activo fijo, etc.
- Pasivos: Sobregiros, cuentas por pagar, obligaciones, etc.
- Patrimonio: Capital, reservas, utilidades, etc.

### Ejemplo de Salida

Antes (❌):
```json
{
  "changed_fields": {"aggregated": true},
  "old_values": {},
  "new_values": {}
}
```

Después (✅):
```json
{
  "changed_fields": {
    "activo_caja_inversiones_disponible": true,
    "activo_total_activos": true,
    "status": true
  },
  "old_values": {
    "activo_caja_inversiones_disponible": "100000.00",
    "activo_total_activos": "500000.00",
    "status": "Borrador"
  },
  "new_values": {
    "activo_caja_inversiones_disponible": "150000.00",
    "activo_total_activos": "550000.00",
    "status": "Completado"
  }
}
```

## Aplicación

```bash
# Desde la carpeta del proyecto
psql -h <host> -d <database> -U <user> -f supabase/migrations/fix_rib_eeff_audit_trigger.sql
```

O usar Supabase CLI:
```bash
supabase db push
```

## Notas

- El trigger usa `SECURITY DEFINER` para poder acceder a `auth.uid()`
- Se maneja errores con `EXCEPTION` para no bloquear operaciones de escritura
- Solo se crean logs cuando hay cambios reales en campos monitoreados
- Los campos técnicos (created_at, updated_at, etc.) no se monitorean

