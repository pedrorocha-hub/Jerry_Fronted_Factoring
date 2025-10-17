# Instrucciones para Configurar Audit Log de EEFF (Estados Financieros)

Este documento explica cómo configurar el sistema de auditoría para la tabla `eeff` en Supabase.

## 📋 Resumen

El sistema de audit log para EEFF permite rastrear todos los cambios realizados en los Estados Financieros, incluyendo:
- Cambios en RUC y año del reporte
- Modificaciones en activos (efectivo, inversiones, cuentas por cobrar, inventarios, etc.)
- Actualizaciones en pasivos (sobregiros, cuentas por pagar, obligaciones financieras, etc.)
- Cambios en patrimonio (capital, reservas, resultados, utilidades/pérdidas, etc.)

## 🚀 Pasos para la Configuración

### 1. Acceder a Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a la sección **SQL Editor** en el menú lateral

### 2. Ejecutar el Script SQL

1. Abre el archivo `eeff_audit_log_setup.sql` ubicado en la raíz del proyecto
2. Copia todo el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

### 3. Verificar la Instalación

Ejecuta las siguientes consultas para verificar que todo se instaló correctamente:

```sql
-- Ver la tabla creada
SELECT * FROM information_schema.tables WHERE table_name = 'eeff_audit_log';

-- Ver los triggers creados
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'eeff_audit%';

-- Ver políticas de RLS
SELECT * FROM pg_policies WHERE tablename = 'eeff_audit_log';
```

## 📊 Estructura de la Tabla

La tabla `eeff_audit_log` tiene la siguiente estructura:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del log |
| `eeff_id` | UUID | ID del EEFF relacionado |
| `user_id` | UUID | ID del usuario que realizó el cambio |
| `user_email` | TEXT | Email del usuario que realizó el cambio |
| `action` | TEXT | Tipo de acción: 'created', 'updated', 'deleted' |
| `changed_fields` | JSONB | Campos que fueron modificados |
| `old_values` | JSONB | Valores anteriores de los campos |
| `new_values` | JSONB | Valores nuevos de los campos |
| `created_at` | TIMESTAMPTZ | Fecha y hora del cambio |

## 🔍 Campos Monitoreados

El sistema de auditoría rastrea cambios en los campos principales de cada categoría:

### Información General
- **ruc**: RUC de la empresa
- **anio_reporte**: Año del reporte financiero

### Activos Principales
- **activo_efectivo_y_equivalentes_de_efectivo**: Efectivo disponible
- **activo_inversiones_financieras**: Inversiones
- **activo_ctas_por_cobrar_comerciales_terceros**: Cuentas por cobrar (terceros)
- **activo_ctas_por_cobrar_comerciales_relacionadas**: Cuentas por cobrar (relacionadas)
- **activo_mercaderias**: Mercaderías en inventario
- **activo_productos_terminados**: Productos terminados
- **activo_materias_primas**: Materias primas
- **activo_propiedades_planta_y_equipo**: Propiedad, planta y equipo
- **activo_total_activo_neto**: Total de activos netos

### Pasivos Principales
- **pasivo_sobregiros_bancarios**: Sobregiros bancarios
- **pasivo_ctas_por_pagar_comerciales_terceros**: Cuentas por pagar (terceros)
- **pasivo_ctas_por_pagar_comerciales_relacionadas**: Cuentas por pagar (relacionadas)
- **pasivo_obligaciones_financieras**: Obligaciones financieras
- **pasivo_total_pasivo**: Total de pasivos

### Patrimonio Principal
- **patrimonio_capital**: Capital social
- **patrimonio_reservas**: Reservas
- **patrimonio_resultados_acumulados_positivos**: Resultados acumulados positivos
- **patrimonio_resultados_acumulados_negativos**: Resultados acumulados negativos
- **patrimonio_utilidad_de_ejercicio**: Utilidad del ejercicio
- **patrimonio_perdida_de_ejercicio**: Pérdida del ejercicio
- **patrimonio_total_patrimonio**: Total patrimonio
- **patrimonio_total_pasivo_y_patrimonio**: Total pasivo y patrimonio

## 💡 Funcionamiento

### Triggers Automáticos

El sistema utiliza triggers de PostgreSQL que se ejecutan automáticamente cuando:
- Se actualiza un Estado Financiero (`UPDATE`)

**Nota:** Por diseño, NO se auditan las siguientes operaciones para evitar ruido:
- Creación de nuevos registros (`INSERT`)
- Eliminación de registros (`DELETE`)

### Contexto del Año

El sistema incluye automáticamente el año del reporte en todos los logs, lo que facilita identificar a qué período financiero corresponde cada cambio.

## 🎯 Uso en la Aplicación

### Ver el Historial de Auditoría

El historial de auditoría está disponible en:

1. **Formulario de Edición de EEFF**: Cuando editas un Estado Financiero, encontrarás un botón "Ver Historial de Cambios" en la parte superior derecha del formulario, junto al botón "Volver al listado".

El visor de auditoría incluye:
- **Filtros avanzados**: Por fecha, acción, y usuario
- **Agrupación inteligente**: Los cambios realizados en la misma operación se agrupan juntos
- **Formato amigable**: Los valores monetarios se formatean automáticamente en soles peruanos (PEN)
- **Información completa**: Muestra valores anteriores y nuevos para cada campo modificado
- **Contexto del año**: Cada campo modificado muestra el año del reporte al que pertenece

### Características del Visor

- 🕒 **Timeline visual**: Muestra todos los cambios en orden cronológico
- 👤 **Información del usuario**: Muestra quién realizó cada cambio
- 📅 **Filtros de fecha**: Filtra cambios por rango de fechas
- 🎯 **Filtros de acción**: Filtra por tipo de cambio (actualizado)
- 👥 **Filtros de usuario**: Busca cambios realizados por usuarios específicos
- 💰 **Formato de moneda**: Todos los valores se muestran en formato PEN (soles peruanos)
- 📊 **Categorización**: Los campos se muestran con nombres descriptivos (Activos, Pasivos, Patrimonio)

## 🔒 Seguridad (RLS)

El sistema implementa Row Level Security (RLS) con las siguientes políticas:

- **SELECT**: Todos los usuarios autenticados pueden ver los logs de auditoría
- **INSERT**: Solo el sistema puede insertar logs (vía triggers)
- **UPDATE/DELETE**: No permitido para ningún usuario

Esto garantiza que los logs de auditoría sean inmutables y confiables.

## 🧪 Probar el Sistema

Para probar que el sistema funciona correctamente:

1. Ve a la página de EEFF en la aplicación (`/eeff`)
2. Haz clic en "Editar" en cualquier Estado Financiero existente
3. Haz clic en el botón "Ver Historial de Cambios" (ícono de reloj/historial)
4. Modifica algún campo, por ejemplo:
   - Cambia el total de activos
   - Actualiza el patrimonio
   - Modifica alguna cuenta por cobrar
5. Guarda los cambios
6. Vuelve a abrir el visor de historial de auditoría
7. Deberías ver el cambio registrado con:
   - Tu nombre de usuario
   - Los campos que modificaste con nombres descriptivos
   - Los valores anteriores y nuevos en formato de moneda
   - El año del reporte entre paréntesis
   - La fecha y hora exacta del cambio

## ❓ Solución de Problemas

### Los cambios no se registran

1. Verifica que los triggers estén activos:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'eeff_audit%';
```

2. Verifica los permisos de RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'eeff_audit_log';
```

### No puedo ver el historial

1. Verifica que estés autenticado en la aplicación
2. Comprueba que la tabla `eeff_audit_log` existe
3. Revisa la consola del navegador en busca de errores
4. Asegúrate de estar en modo "edición" de un EEFF existente

### Errores de permisos

Si obtienes errores de permisos al ejecutar el script:
- Asegúrate de estar conectado como administrador del proyecto en Supabase
- Verifica que tienes permisos suficientes en tu organización de Supabase

## 📝 Mantenimiento

### Limpiar logs antiguos (opcional)

Si deseas eliminar logs antiguos para liberar espacio:

```sql
-- Eliminar logs más antiguos de 2 años
DELETE FROM eeff_audit_log 
WHERE created_at < NOW() - INTERVAL '2 years';
```

### Ver estadísticas de auditoría

```sql
-- Contar logs por usuario
SELECT user_email, COUNT(*) as total_changes
FROM eeff_audit_log
GROUP BY user_email
ORDER BY total_changes DESC;

-- Contar logs por acción
SELECT action, COUNT(*) as total
FROM eeff_audit_log
GROUP BY action;

-- Ver los cambios más recientes
SELECT 
  e.ruc,
  e.anio_reporte,
  a.action,
  a.user_email,
  a.created_at
FROM eeff_audit_log a
JOIN eeff e ON e.id = a.eeff_id
ORDER BY a.created_at DESC
LIMIT 10;
```

### Analizar cambios por empresa

```sql
-- Ver historial de cambios para un RUC específico
SELECT 
  e.ruc,
  e.anio_reporte,
  a.action,
  a.changed_fields,
  a.user_email,
  a.created_at
FROM eeff_audit_log a
JOIN eeff e ON e.id = a.eeff_id
WHERE e.ruc = '20123456789'  -- Reemplaza con el RUC que deseas consultar
ORDER BY a.created_at DESC;
```

## 🎓 Buenas Prácticas

1. **No modifiques manualmente** los logs de auditoría - son gestionados automáticamente por el sistema
2. **Revisa regularmente** los cambios en estados financieros importantes para asegurar la integridad de los datos
3. **Utiliza los filtros** del visor para encontrar cambios específicos rápidamente
4. **Documenta grandes cambios** en tus registros internos, especialmente ajustes significativos
5. **Verifica la consistencia** entre activo, pasivo y patrimonio al revisar cambios históricos
6. **Mantén un registro** de las razones de cambios importantes fuera del sistema de auditoría

## 📚 Casos de Uso Comunes

### Auditoría de fin de año
Revisa todos los cambios realizados a los estados financieros durante el cierre fiscal:
```sql
SELECT * FROM eeff_audit_log 
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at;
```

### Verificación de ajustes contables
Identifica cuándo y quién realizó ajustes importantes en cuentas específicas usando los filtros del visor web.

### Reconciliación de datos
Compara valores históricos con valores actuales para identificar discrepancias.

## 📞 Soporte

Si encuentras algún problema o tienes preguntas sobre el sistema de auditoría de EEFF, contacta al equipo de desarrollo.

---

**Última actualización**: Octubre 2025
**Versión del sistema**: 1.0

