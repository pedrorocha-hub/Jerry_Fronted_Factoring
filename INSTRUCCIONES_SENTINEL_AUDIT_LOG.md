# Instrucciones para Configurar Audit Log de Sentinel

Este documento explica cómo configurar el sistema de auditoría para la tabla `sentinel` en Supabase.

## 📋 Resumen

El sistema de audit log para Sentinel permite rastrear todos los cambios realizados en los documentos Sentinel, incluyendo:
- Cambios en RUC
- Cambios de estado
- Modificaciones en score y calificaciones
- Actualizaciones en deudas (directa, indirecta, SUNAT)
- Cambios en impagos y protestos

## 🚀 Pasos para la Configuración

### 1. Acceder a Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a la sección **SQL Editor** en el menú lateral

### 2. Ejecutar el Script SQL

1. Abre el archivo `sentinel_audit_log_setup.sql` ubicado en la raíz del proyecto
2. Copia todo el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### 3. Verificar la Instalación

Ejecuta las siguientes consultas para verificar que todo se instaló correctamente:

```sql
-- Ver la tabla creada
SELECT * FROM information_schema.tables WHERE table_name = 'sentinel_audit_log';

-- Ver los triggers creados
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'sentinel_audit%';

-- Ver políticas de RLS
SELECT * FROM pg_policies WHERE tablename = 'sentinel_audit_log';
```

## 📊 Estructura de la Tabla

La tabla `sentinel_audit_log` tiene la siguiente estructura:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del log |
| `sentinel_id` | UUID | ID del documento Sentinel relacionado |
| `user_id` | UUID | ID del usuario que realizó el cambio |
| `user_email` | TEXT | Email del usuario que realizó el cambio |
| `action` | TEXT | Tipo de acción: 'created', 'updated', 'status_changed', 'deleted' |
| `changed_fields` | JSONB | Campos que fueron modificados |
| `old_values` | JSONB | Valores anteriores de los campos |
| `new_values` | JSONB | Valores nuevos de los campos |
| `created_at` | TIMESTAMPTZ | Fecha y hora del cambio |

## 🔍 Campos Monitoreados

El sistema de auditoría rastrea cambios en los siguientes campos:

- **ruc**: RUC de la empresa
- **status**: Estado del documento
- **score**: Score o calificación
- **comportamiento_calificacion**: Calificación del comportamiento
- **deuda_directa**: Monto de deuda directa
- **deuda_indirecta**: Monto de deuda indirecta
- **impagos**: Monto de impagos
- **deudas_sunat**: Monto de deudas con SUNAT
- **protestos**: Monto de protestos

## 💡 Funcionamiento

### Triggers Automáticos

El sistema utiliza triggers de PostgreSQL que se ejecutan automáticamente cuando:
- Se actualiza un documento Sentinel (`UPDATE`)

**Nota:** Por diseño, NO se auditan las siguientes operaciones para evitar ruido:
- Creación de nuevos registros (`INSERT`)
- Eliminación de registros (`DELETE`)

### Cambios de Estado Especiales

Cuando el campo `status` cambia, el sistema registra la acción como `status_changed` en lugar de `updated`, lo que permite filtrar y visualizar los cambios de estado de manera más específica.

## 🎯 Uso en la Aplicación

### Ver el Historial de Auditoría

El historial de auditoría está disponible en:

1. **Modal de Sentinel**: Cuando ves o editas un documento Sentinel, encontrarás un botón "Ver Historial de Cambios" en la parte superior del modal.

El visor de auditoría incluye:
- **Filtros avanzados**: Por fecha, acción, y usuario
- **Agrupación inteligente**: Los cambios realizados en la misma operación se agrupan juntos
- **Formato amigable**: Los valores monetarios se formatean automáticamente en soles peruanos
- **Información completa**: Muestra valores anteriores y nuevos para cada campo modificado

### Características del Visor

- 🕒 **Timeline visual**: Muestra todos los cambios en orden cronológico
- 👤 **Información del usuario**: Muestra quién realizó cada cambio
- 📅 **Filtros de fecha**: Filtra cambios por rango de fechas
- 🎯 **Filtros de acción**: Filtra por tipo de cambio (actualizado, estado cambiado, etc.)
- 👥 **Filtros de usuario**: Busca cambios realizados por usuarios específicos
- 💰 **Formato de moneda**: Los valores monetarios se muestran en formato PEN (soles)

## 🔒 Seguridad (RLS)

El sistema implementa Row Level Security (RLS) con las siguientes políticas:

- **SELECT**: Todos los usuarios autenticados pueden ver los logs de auditoría
- **INSERT**: Solo el sistema puede insertar logs (vía triggers)
- **UPDATE/DELETE**: No permitido para ningún usuario

Esto garantiza que los logs de auditoría sean inmutables y confiables.

## 🧪 Probar el Sistema

Para probar que el sistema funciona correctamente:

1. Ve a la página de Sentinel en la aplicación
2. Abre un documento Sentinel existente
3. Edita algún campo (por ejemplo, cambia el score o la deuda directa)
4. Guarda los cambios
5. Abre el visor de historial de auditoría
6. Deberías ver el cambio registrado con:
   - Tu nombre de usuario
   - Los campos que modificaste
   - Los valores anteriores y nuevos
   - La fecha y hora exacta del cambio

## ❓ Solución de Problemas

### Los cambios no se registran

1. Verifica que los triggers estén activos:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'sentinel_audit%';
```

2. Verifica los permisos de RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'sentinel_audit_log';
```

### No puedo ver el historial

1. Verifica que estés autenticado en la aplicación
2. Comprueba que la tabla `sentinel_audit_log` existe
3. Revisa la consola del navegador en busca de errores

### Errores de permisos

Si obtienes errores de permisos al ejecutar el script:
- Asegúrate de estar conectado como administrador del proyecto en Supabase
- Verifica que tienes permisos suficientes en tu organización de Supabase

## 📝 Mantenimiento

### Limpiar logs antiguos (opcional)

Si deseas eliminar logs antiguos para liberar espacio:

```sql
-- Eliminar logs más antiguos de 1 año
DELETE FROM sentinel_audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Ver estadísticas de auditoría

```sql
-- Contar logs por usuario
SELECT user_email, COUNT(*) as total_changes
FROM sentinel_audit_log
GROUP BY user_email
ORDER BY total_changes DESC;

-- Contar logs por tipo de acción
SELECT action, COUNT(*) as total
FROM sentinel_audit_log
GROUP BY action;
```

## 🎓 Buenas Prácticas

1. **No modifiques manualmente** los logs de auditoría - son gestionados automáticamente por el sistema
2. **Revisa regularmente** los cambios importantes para mantener control sobre las modificaciones
3. **Utiliza los filtros** del visor para encontrar cambios específicos rápidamente
4. **Documenta cambios importantes** usando comentarios en tu flujo de trabajo

## 📞 Soporte

Si encuentras algún problema o tienes preguntas sobre el sistema de auditoría, contacta al equipo de desarrollo.

---

**Última actualización**: Octubre 2025
**Versión del sistema**: 1.0

