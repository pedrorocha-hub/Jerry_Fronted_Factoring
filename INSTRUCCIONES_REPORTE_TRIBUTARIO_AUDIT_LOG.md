# Instrucciones para Configurar Audit Log de Reporte Tributario

Este documento explica cómo configurar el sistema de auditoría para la tabla `reporte_tributario` en Supabase.

## 📋 Resumen

El sistema de audit log para Reporte Tributario permite rastrear todos los cambios realizados en los reportes tributarios anuales, incluyendo:
- Cambios en información general (año, RUC, razón social)
- Modificaciones en datos de RUC (estado, condición, actividad económica)
- Actualizaciones en declaración anual de renta (ingresos, activos, patrimonio, resultados)
- Cambios en ITAN (declaración, base imponible, cuotas)
- Modificaciones en ingresos y ventas mensuales

## 🚀 Pasos para la Configuración

### 1. Acceder a Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a la sección **SQL Editor** en el menú lateral

### 2. Ejecutar el Script SQL

1. Abre el archivo `reporte_tributario_audit_log_setup.sql` ubicado en la raíz del proyecto
2. Copia todo el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### 3. Verificar la Instalación

Ejecuta las siguientes consultas para verificar que todo se instaló correctamente:

```sql
-- Ver la tabla creada
SELECT * FROM information_schema.tables WHERE table_name = 'reporte_tributario_audit_log';

-- Ver los triggers creados
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'reporte_tributario_audit%';

-- Ver políticas de RLS
SELECT * FROM pg_policies WHERE tablename = 'reporte_tributario_audit_log';
```

## 📊 Estructura de la Tabla

La tabla `reporte_tributario_audit_log` tiene la siguiente estructura:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del log |
| `reporte_tributario_id` | INTEGER | ID del reporte tributario relacionado |
| `user_id` | UUID | ID del usuario que realizó el cambio |
| `user_email` | TEXT | Email del usuario que realizó el cambio |
| `action` | TEXT | Tipo de acción: 'created', 'updated', 'deleted' |
| `changed_fields` | JSONB | Campos que fueron modificados |
| `old_values` | JSONB | Valores anteriores de los campos |
| `new_values` | JSONB | Valores nuevos de los campos |
| `created_at` | TIMESTAMPTZ | Fecha y hora del cambio |

## 🔍 Campos Monitoreados

El sistema de auditoría rastrea cambios en los campos más importantes:

### Información General
- **anio_reporte**: Año del reporte
- **razon_social**: Razón social de la empresa
- **ruc**: RUC de la empresa

### Datos de RUC
- **ruc_estado_contribuyente**: Estado del contribuyente
- **ruc_condicion_contribuyente**: Condición del contribuyente  
- **ruc_actividad_economica**: Actividad económica principal

### Declaración Anual de Renta (Campos Principales)
- **renta_ingresos_netos**: Ingresos netos del ejercicio
- **renta_otros_ingresos**: Otros ingresos
- **renta_total_activos_netos**: Total de activos netos
- **renta_total_cuentas_por_pagar**: Total de cuentas por pagar
- **renta_total_patrimonio**: Total patrimonio
- **renta_capital_social**: Capital social
- **renta_resultado_bruto**: Resultado bruto
- **renta_resultado_antes_participaciones**: Resultado antes de participaciones
- **renta_importe_pagado**: Importe pagado

### ITAN (Impuesto Temporal a los Activos Netos)
- **itan_presento_declaracion**: Si presentó declaración ITAN
- **itan_base_imponible**: Base imponible
- **itan_itan_a_pagar**: ITAN a pagar

### Ingresos Mensuales Declarados
- **ingresos_enero** a **ingresos_diciembre**: Ingresos de cada mes

### Ventas Anuales
- **ventas_total_ingresos**: Total de ingresos anuales
- **ventas_total_essalud**: Total ESSALUD anual

## 💡 Funcionamiento

### Triggers Automáticos

El sistema utiliza triggers de PostgreSQL que se ejecutan automáticamente cuando:
- Se actualiza un Reporte Tributario (`UPDATE`)

**Nota:** Por diseño, NO se auditan las siguientes operaciones para evitar ruido:
- Creación de nuevos registros (`INSERT`)
- Eliminación de registros (`DELETE`)

### Contexto del Año

El sistema incluye automáticamente el año del reporte en todos los logs, lo que facilita identificar a qué período fiscal corresponde cada cambio.

## 🎯 Uso en la Aplicación

### Ver el Historial de Auditoría

El historial de auditoría está disponible en:

1. **Modal de Reporte Tributario**: Cuando visualizas o editas un reporte tributario, encontrarás un botón "Ver Historial de Cambios" en la parte superior del modal (solo visible para administradores).

El visor de auditoría incluye:
- **Filtros avanzados**: Por fecha, acción, y usuario
- **Agrupación inteligente**: Los cambios realizados en la misma operación se agrupan juntos
- **Formato amigable**: Los valores monetarios se formatean automáticamente en soles peruanos (PEN)
- **Fechas legibles**: Las fechas se muestran en formato dd/mm/aaaa
- **Información completa**: Muestra valores anteriores y nuevos para cada campo modificado
- **Contexto del año**: Cada cambio incluye el año del reporte al que pertenece

### Características del Visor

- 🕒 **Timeline visual**: Muestra todos los cambios en orden cronológico
- 👤 **Información del usuario**: Muestra quién realizó cada cambio
- 📅 **Filtros de fecha**: Filtra cambios por rango de fechas
- 🎯 **Filtros de acción**: Filtra por tipo de cambio (actualizado)
- 👥 **Filtros de usuario**: Busca cambios realizados por usuarios específicos
- 💰 **Formato de moneda**: Todos los valores monetarios se muestran en formato PEN (soles peruanos)
- 📊 **Categorización**: Los campos se organizan por categorías (General, RUC, Renta, ITAN, Ingresos, Ventas)

## 🔒 Seguridad (RLS)

El sistema implementa Row Level Security (RLS) con las siguientes políticas:

- **SELECT**: Todos los usuarios autenticados pueden ver los logs de auditoría
- **INSERT**: Solo el sistema puede insertar logs (vía triggers)
- **UPDATE/DELETE**: No permitido para ningún usuario

Esto garantiza que los logs de auditoría sean inmutables y confiables.

## 🧪 Probar el Sistema

Para probar que el sistema funciona correctamente:

1. Ve a la página de Reportes Tributarios en la aplicación
2. Selecciona una empresa y visualiza sus reportes
3. Haz clic en "Ver" o "Editar" en cualquier reporte
4. Haz clic en el botón "Ver Historial de Cambios"
5. Si no hay cambios previos, edita el reporte:
   - Modifica algún campo, por ejemplo:
     - Cambia los ingresos netos
     - Actualiza el resultado bruto
     - Modifica algún ingreso mensual
6. Guarda los cambios
7. Vuelve a abrir el visor de historial de auditoría
8. Deberías ver el cambio registrado con:
   - Tu nombre de usuario
   - Los campos que modificaste con nombres descriptivos
   - Los valores anteriores y nuevos en el formato apropiado (moneda o texto)
   - El año del reporte entre paréntesis
   - La fecha y hora exacta del cambio

## ❓ Solución de Problemas

### Los cambios no se registran

1. Verifica que los triggers estén activos:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'reporte_tributario_audit%';
```

2. Verifica los permisos de RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'reporte_tributario_audit_log';
```

### No puedo ver el historial

1. Verifica que estés autenticado en la aplicación
2. Comprueba que la tabla `reporte_tributario_audit_log` existe
3. Verifica que eres administrador (el botón solo es visible para admins)
4. Revisa la consola del navegador en busca de errores

### Errores de permisos

Si obtienes errores de permisos al ejecutar el script:
- Asegúrate de estar conectado como administrador del proyecto en Supabase
- Verifica que tienes permisos suficientes en tu organización de Supabase

## 📝 Mantenimiento

### Limpiar logs antiguos (opcional)

Si deseas eliminar logs antiguos para liberar espacio:

```sql
-- Eliminar logs más antiguos de 3 años
DELETE FROM reporte_tributario_audit_log 
WHERE created_at < NOW() - INTERVAL '3 years';
```

### Ver estadísticas de auditoría

```sql
-- Contar logs por usuario
SELECT user_email, COUNT(*) as total_changes
FROM reporte_tributario_audit_log
GROUP BY user_email
ORDER BY total_changes DESC;

-- Contar logs por acción
SELECT action, COUNT(*) as total
FROM reporte_tributario_audit_log
GROUP BY action;

-- Ver los cambios más recientes
SELECT 
  rt.ruc,
  rt.razon_social,
  rt.anio_reporte,
  a.action,
  a.user_email,
  a.created_at
FROM reporte_tributario_audit_log a
JOIN reporte_tributario rt ON rt.id = a.reporte_tributario_id
ORDER BY a.created_at DESC
LIMIT 10;
```

### Analizar cambios por empresa

```sql
-- Ver historial de cambios para un RUC específico
SELECT 
  rt.ruc,
  rt.razon_social,
  rt.anio_reporte,
  a.action,
  a.changed_fields,
  a.user_email,
  a.created_at
FROM reporte_tributario_audit_log a
JOIN reporte_tributario rt ON rt.id = a.reporte_tributario_id
WHERE rt.ruc = '20123456789'  -- Reemplaza con el RUC que deseas consultar
ORDER BY a.created_at DESC;
```

### Analizar cambios en campos específicos

```sql
-- Ver todos los cambios en ingresos netos
SELECT 
  rt.ruc,
  rt.razon_social,
  rt.anio_reporte,
  a.old_values->>'renta_ingresos_netos' as ingreso_anterior,
  a.new_values->>'renta_ingresos_netos' as ingreso_nuevo,
  a.user_email,
  a.created_at
FROM reporte_tributario_audit_log a
JOIN reporte_tributario rt ON rt.id = a.reporte_tributario_id
WHERE a.changed_fields->>'renta_ingresos_netos' = 'true'
ORDER BY a.created_at DESC;
```

## 🎓 Buenas Prácticas

1. **No modifiques manualmente** los logs de auditoría - son gestionados automáticamente por el sistema
2. **Revisa regularmente** los cambios en reportes tributarios para asegurar la integridad de los datos fiscales
3. **Utiliza los filtros** del visor para encontrar cambios específicos rápidamente
4. **Documenta grandes cambios** en tus registros internos, especialmente ajustes de cierre fiscal
5. **Verifica la consistencia** entre diferentes períodos al revisar cambios históricos
6. **Mantén un registro externo** de las razones de cambios importantes

## 📚 Casos de Uso Comunes

### Auditoría de cierre fiscal anual
Revisa todos los cambios realizados durante el cierre del ejercicio fiscal:
```sql
SELECT * FROM reporte_tributario_audit_log 
WHERE created_at BETWEEN '2024-12-01' AND '2025-03-31'
ORDER BY created_at;
```

### Verificación de correcciones tributarias
Identifica cuándo y quién realizó correcciones en declaraciones:
```sql
SELECT 
  rt.ruc,
  rt.anio_reporte,
  a.changed_fields,
  a.old_values,
  a.new_values,
  a.user_email,
  a.created_at
FROM reporte_tributario_audit_log a
JOIN reporte_tributario rt ON rt.id = a.reporte_tributario_id
WHERE a.changed_fields ? 'renta_resultado_antes_participaciones'
ORDER BY a.created_at DESC;
```

### Análisis de cambios en ingresos mensuales
Revisa las modificaciones en declaraciones mensuales:
```sql
SELECT 
  rt.ruc,
  rt.anio_reporte,
  jsonb_object_keys(a.changed_fields) as campo_cambiado,
  a.old_values,
  a.new_values,
  a.created_at
FROM reporte_tributario_audit_log a
JOIN reporte_tributario rt ON rt.id = a.reporte_tributario_id
WHERE jsonb_object_keys(a.changed_fields) LIKE 'ingresos_%'
ORDER BY a.created_at DESC;
```

### Reconciliación de datos históricos
Compara valores históricos con valores actuales para identificar discrepancias.

## 📞 Soporte

Si encuentras algún problema o tienes preguntas sobre el sistema de auditoría de Reporte Tributario, contacta al equipo de desarrollo.

---

**Última actualización**: Octubre 2025
**Versión del sistema**: 1.0

