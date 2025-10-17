# Sistema de Audit Log para RIB EEFF

## Descripción
Este documento describe cómo implementar el sistema completo de historial de cambios (audit log) para el módulo RIB EEFF.

## Archivos Creados

### 1. Tipos TypeScript
- **Archivo**: `src/types/rib-eeff-audit-log.ts`
- **Contenido**: Define los tipos `RibEeffAuditLog`, `RibEeffAuditLogWithUserInfo` y `RibEeffAuditAction`

### 2. Servicio
- **Archivo**: `src/services/ribEeffAuditLogService.ts`
- **Contenido**: Clase `RibEeffAuditLogService` con métodos para:
  - `getLogsByRibEeffId()`: Obtener logs por ID de reporte
  - `getLogsByRucAndSolicitud()`: Obtener logs por RUC y solicitud
  - `getLastChange()`: Obtener el último cambio
  - `getChangeStats()`: Obtener estadísticas de cambios

### 3. Componente Viewer
- **Archivo**: `src/components/audit/RibEeffAuditLogViewer.tsx`
- **Contenido**: Componente React que muestra el historial de cambios en un modal

### 4. Script SQL
- **Archivo**: `rib_eeff_audit_log_setup.sql`
- **Contenido**: Script completo para crear:
  - Tabla `rib_eeff_audit_log`
  - Índices para rendimiento
  - Políticas RLS
  - Función trigger
  - Triggers automáticos

## Pasos de Implementación

### PASO 1: Configurar Base de Datos

1. Abre tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `rib_eeff_audit_log_setup.sql`
4. Ejecuta el script
5. Verifica que no haya errores

### PASO 2: Integrar en el Formulario

Abre el archivo `src/pages/RibEeffForm.tsx` y agrega el visor de audit log:

1. Importar el componente:
```typescript
import RibEeffAuditLogViewer from '@/components/audit/RibEeffAuditLogViewer';
```

2. Agregar el botón en la interfaz (sugiero agregarlo junto al botón "Cargar datos de EEFF"):

```typescript
// En el Card de "Selección de Empresas y Solicitud", agrega:
<div className="md:col-span-2 flex justify-between items-end gap-3">
  <div>
    <Label htmlFor="status">Estado General</Label>
    <Select name="status" onValueChange={(value: any) => setStatus(value)} value={status}>
      {/* ... contenido actual ... */}
    </Select>
  </div>
  
  <div className="flex gap-3">
    {id && (
      <RibEeffAuditLogViewer ribEeffId={id} />
    )}
    
    <Button type="button" variant="outline" onClick={handleLoadEeffData} disabled={!proveedorRuc || loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Cargando...' : 'Cargar datos de EEFF'}
    </Button>
  </div>
</div>
```

### PASO 3: Verificar Funcionamiento

1. Edita un reporte de RIB EEFF existente
2. Realiza cambios en los datos (ej: modifica valores de activos, pasivos, o cambia el status)
3. Guarda los cambios
4. Haz clic en el botón **"Ver Historial de Cambios"**
5. Deberías ver todos los cambios registrados con:
   - Usuario que realizó el cambio
   - Fecha y hora
   - Campos modificados
   - Valores anteriores y nuevos

## Campos Monitoreados

El sistema registra cambios en los siguientes campos:

### Metadatos
- `status` - Estado del reporte
- `solicitud_id` - Solicitud asociada
- `tipo_entidad` - Tipo (proveedor/deudor)
- `anio_reporte` - Año del reporte

### Activos Principales
- Caja e Inversiones Disponibles
- Cuentas por Cobrar del Giro
- Existencias
- Total Activo Circulante
- Activo Fijo Neto
- **Total Activos**

### Pasivos Principales
- Sobregiro Bancos y Obligaciones
- Cuentas por Pagar del Giro
- Total Pasivos Circulantes
- **Total Pasivos**

### Patrimonio Principales
- Capital Pagado
- Total Patrimonio
- **Total Pasivos y Patrimonio**

## Características del Sistema

✅ **Automático**: Los cambios se registran automáticamente mediante triggers en la base de datos
✅ **Seguro**: Usa Row Level Security (RLS) de Supabase
✅ **Eficiente**: Solo registra cambios en campos importantes, ignora campos técnicos (created_at, updated_at)
✅ **Agrupado**: Agrupa cambios realizados en la misma operación (menos de 5 segundos de diferencia)
✅ **Informativo**: Muestra usuario, fecha, valores anteriores y nuevos
✅ **Formato amigable**: Formatea números como moneda, fechas localizadas

## Tipos de Acciones Registradas

- `created` - Cuando se crea un nuevo reporte (deshabilitado por defecto para evitar ruido)
- `updated` - Cuando se actualizan campos del reporte
- `status_changed` - Cuando cambia el estado del reporte
- `deleted` - Cuando se elimina un reporte (deshabilitado por defecto)

## Troubleshooting

### No se registran cambios
1. Verifica que los triggers estén creados:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'rib_eeff_audit%';
```

2. Verifica que la tabla exista:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'rib_eeff_audit_log';
```

### Error al ver historial
1. Verifica las políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'rib_eeff_audit_log';
```

2. Verifica que el usuario esté autenticado en Supabase

## Personalización

### Agregar más campos al monitoreo
Edita el archivo SQL y agrega campos al array `v_monitored_fields`:

```sql
v_monitored_fields TEXT[] := ARRAY[
    'status',
    'solicitud_id',
    'tu_nuevo_campo_aqui'
];
```

Luego agrega las comparaciones y conversiones en los bloques CASE correspondientes.

### Cambiar formato de visualización
Edita el método `formatValue()` en `RibEeffAuditLogViewer.tsx` para personalizar cómo se muestran los valores.

## Fecha de Implementación
17 de Octubre, 2025
