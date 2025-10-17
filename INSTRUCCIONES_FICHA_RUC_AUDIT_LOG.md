# Sistema de Audit Log Unificado para Ficha RUC

## Descripción
Este documento describe el sistema completo de historial de cambios (audit log) implementado para el módulo de Fichas RUC. Este sistema es **UNIFICADO** y muestra en un solo lugar los cambios de:
- ✅ Ficha RUC (datos de la empresa)
- ✅ Accionistas
- ✅ Gerencia

## Archivos Creados

### 1. Tipos TypeScript
- **Archivo**: `src/types/ficha-ruc-audit-log.ts` - Tipos para Ficha RUC
- **Archivo**: `src/types/accionista-audit-log.ts` - Tipos para Accionistas
- **Archivo**: `src/types/gerencia-audit-log.ts` - Tipos para Gerencia

### 2. Servicio
- **Archivo**: `src/services/fichaRucAuditLogService.ts`
- **Contenido**: Clase `FichaRucAuditLogService` con métodos para:
  - `getUnifiedLogsByRuc()`: **Obtener logs unificados** de Ficha RUC + Accionistas + Gerencia
  - `getLogsByFichaRucId()`: Obtener logs solo de ficha
  - `getLogsByRuc()`: Obtener logs por RUC
  - `getLastChange()`: Obtener el último cambio
  - `getChangeStats()`: Obtener estadísticas de cambios

### 3. Componente Viewer
- **Archivo**: `src/components/audit/FichaRucAuditLogViewer.tsx`
- **Contenido**: Componente React que muestra el historial **unificado** de cambios

### 4. Scripts SQL
- **Archivo**: `ficha_ruc_audit_log_setup.sql` - Para tabla ficha_ruc
- **Archivo**: `accionista_gerencia_audit_log_setup.sql` - Para tablas accionista y gerencia

### 5. Integración
- **Archivo modificado**: `src/components/ficha-ruc/FichaRucTable.tsx`
- **Cambio**: Agregado botón "Historial" en la columna de acciones de cada fila

## Pasos de Implementación

### PASO 1: Configurar Base de Datos

Debes ejecutar **DOS scripts SQL** en orden:

**Script 1: Ficha RUC**
1. Abre tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `ficha_ruc_audit_log_setup.sql`
4. Ejecuta el script
5. Verifica que no haya errores

**Script 2: Accionistas y Gerencia**
1. En **SQL Editor**
2. Copia y pega el contenido de `accionista_gerencia_audit_log_setup.sql`
3. Ejecuta el script
4. Verifica que no haya errores

### PASO 2: Frontend ✅ (YA COMPLETADO)

El botón de historial ya está integrado en la tabla de Fichas RUC. Aparece entre el botón "Editar" y "Exportar".

## Ubicación en la Interfaz

El botón de historial aparece en cada fila de la tabla de Fichas RUC:

```
[Ver] [Editar] [Historial] [Exportar] [Eliminar]
```

## Campos Monitoreados

El sistema registra cambios en los siguientes campos:

### Ficha RUC (Tabla Principal)
- `nombre_empresa` - Nombre de la empresa
- `ruc` - Número RUC
- `actividad_empresa` - Actividad empresarial
- `fecha_inicio_actividades` - Fecha de inicio de actividades
- `estado_contribuyente` - Estado del contribuyente (Activo, Suspendido, etc.)
- `domicilio_fiscal` - Dirección del domicilio fiscal
- `nombre_representante_legal` - Nombre del representante legal

### Accionistas (Tabla Relacionada)
- `dni` - DNI del accionista
- `nombre` - Nombre completo
- `porcentaje` - Porcentaje de participación
- `vinculo` - Vínculo con la empresa
- `calificacion` - Calificación
- `comentario` - Comentarios adicionales

### Gerencia (Tabla Relacionada)
- `dni` - DNI del gerente
- `nombre` - Nombre completo
- `cargo` - Cargo que ocupa
- `vinculo` - Vínculo con la empresa
- `calificacion` - Calificación
- `comentario` - Comentarios adicionales

## Características del Sistema

✅ **Unificado**: Muestra cambios de Ficha RUC, Accionistas y Gerencia en un solo lugar
✅ **Automático**: Los cambios se registran automáticamente mediante triggers en la base de datos
✅ **Seguro**: Usa Row Level Security (RLS) de Supabase
✅ **Completo**: Registra creaciones, actualizaciones y eliminaciones
✅ **Informativo**: Muestra usuario, fecha, valores anteriores y nuevos
✅ **Accesible**: Botón visible en cada fila de la tabla
✅ **Ordenado**: Todos los cambios ordenados cronológicamente
✅ **Identificado**: Cada cambio muestra de qué entidad proviene (Ficha/Accionista/Gerencia)

## Tipos de Acciones Registradas

### Para Ficha RUC:
- `created` - Cuando se crea una nueva ficha RUC
- `updated` - Cuando se actualizan campos de la ficha
- `deleted` - Cuando se elimina una ficha RUC

### Para Accionistas:
- `created` - Cuando se agrega un accionista
- `updated` - Cuando se modifican datos del accionista
- `deleted` - Cuando se elimina un accionista

### Para Gerencia:
- `created` - Cuando se agrega un gerente
- `updated` - Cuando se modifican datos del gerente
- `deleted` - Cuando se elimina un gerente

## Cómo Usar

### Ver el Historial

1. Ve a la página **"Fichas RUC"**
2. En la tabla, busca la ficha que deseas revisar
3. Haz clic en el botón **"Historial"** (ícono de reloj)
4. Se abrirá un modal mostrando todos los cambios con:
   - ✅ Usuario que realizó el cambio
   - ✅ Fecha y hora exacta
   - ✅ Tipo de acción (creado, actualizado, eliminado)
   - ✅ Campos modificados
   - ✅ Valores anteriores vs nuevos

### Ejemplo de Uso

**Caso 1: Ver quién cambió el estado de un contribuyente**
1. Clic en "Historial" de la ficha
2. Busca cambios en "Estado del Contribuyente"
3. Ve quién cambió de "Activo" a "Suspendido" y cuándo

**Caso 2: Auditar cambios en domicilio fiscal**
1. Clic en "Historial"
2. Filtra cambios en "Domicilio Fiscal"
3. Compara direcciones anteriores vs nuevas

**Caso 3: Ver histórico completo de una empresa**
1. Clic en "Historial"
2. Ve **TODOS** los cambios ordenados cronológicamente:
   - Cuándo se creó la ficha
   - Qué accionistas se agregaron/modificaron/eliminaron
   - Qué gerentes se agregaron/modificaron/eliminaron
   - Cambios en datos de la empresa

**Caso 4: Auditar cambios en accionistas**
1. Clic en "Historial"
2. Verás badges que indican:
   - 🟣 **Ficha RUC** - Cambios en datos de empresa
   - 🔵 **Accionista** - Cambios en accionistas
   - 🟡 **Gerencia** - Cambios en gerentes
3. Ejemplo: "Juan Pérez cambió de 40% a 45% de participación"

### Ejemplo Visual del Historial

```
┌─────────────────────────────────────────────────────┐
│ 📝 Actualizado │ 🔵 Accionista │ 17/Oct/2025 14:30  │
│ Usuario: María García                               │
│ ─────────────────────────────────────────────────── │
│ Porcentaje de Participación                        │
│   Anterior: 40%    →    Nuevo: 45%                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ✅ Creado │ 🟡 Gerencia │ 17/Oct/2025 12:15         │
│ Usuario: Juan López                                 │
│ ─────────────────────────────────────────────────── │
│ ✨ Gerente agregado: Carlos Ruiz (Gerente General) │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📝 Actualizado │ 🟣 Ficha RUC │ 17/Oct/2025 10:00   │
│ Usuario: Sistema                                    │
│ ─────────────────────────────────────────────────── │
│ Estado del Contribuyente                           │
│   Anterior: Activo    →    Nuevo: Suspendido       │
└─────────────────────────────────────────────────────┘
```

## Verificación

### Probar el Sistema

1. **Edita una Ficha RUC existente**:
   - Cambia el nombre de la empresa
   - Cambia el estado del contribuyente
   - Guarda los cambios

2. **Abre el Historial**:
   - Haz clic en el botón "Historial"
   - Deberías ver los cambios registrados

3. **Verifica la información**:
   - ✅ Usuario correcto
   - ✅ Fecha actual
   - ✅ Campos modificados
   - ✅ Valores anteriores y nuevos

### Troubleshooting

#### No se registran cambios
1. Verifica que los triggers estén creados:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'ficha_ruc_audit%';
```

2. Verifica que la tabla exista:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'ficha_ruc_audit_log';
```

#### Error al ver historial
1. Verifica las políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'ficha_ruc_audit_log';
```

2. Verifica que el usuario esté autenticado en Supabase

## Personalización

### Agregar más campos al monitoreo
Edita el archivo SQL y agrega campos al array `v_monitored_fields`:

```sql
v_monitored_fields TEXT[] := ARRAY[
    'nombre_empresa',
    'ruc',
    'tu_nuevo_campo_aqui'
];
```

Luego agrega las comparaciones y conversiones en los bloques CASE correspondientes.

### Cambiar estilo del botón
Edita `FichaRucAuditLogViewer.tsx` en la sección `DialogTrigger`:

```typescript
<Button variant="outline" size="sm" className="tu-clase-personalizada">
  <History className="h-4 w-4 mr-2" />
  Historial
</Button>
```

## Beneficios del Sistema

✅ **Trazabilidad**: Saber quién hizo qué y cuándo
✅ **Auditoría**: Cumplir con requisitos de auditoría
✅ **Seguridad**: Detectar cambios no autorizados
✅ **Transparencia**: Historial completo de modificaciones
✅ **Recuperación**: Saber qué valores tenía antes un campo

## Fecha de Implementación
17 de Octubre, 2025
