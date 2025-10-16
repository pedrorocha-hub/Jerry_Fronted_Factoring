# 📋 Instrucciones para Configurar el Audit Log de RIB Reporte Tributario

## Problema Identificado

El historial de auditoría muestra que los campos fueron modificados pero no muestra los valores anteriores ni los nuevos (aparecen como "N/A"). Esto ocurre porque:

1. **No existe la tabla** `rib_reporte_tributario_audit_log` en Supabase
2. **No existen los triggers** que capturen automáticamente los cambios
3. El método de guardado hace DELETE + INSERT en lugar de UPDATE

## Solución

Debes ejecutar el script SQL `rib_reporte_tributario_audit_log_setup.sql` en Supabase para crear la infraestructura necesaria.

## 📝 Pasos para Configurar

### 1. Acceder a Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto

### 2. Abrir el SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"** o **"SQL"**
2. Haz clic en **"New query"** o **"Nueva consulta"**

### 3. Ejecutar el Script

1. Abre el archivo `rib_reporte_tributario_audit_log_setup.sql`
2. **Copia TODO el contenido** del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en el botón **"Run"** o **"Ejecutar"** (generalmente con el icono ▶️)

### 4. Verificar la Instalación

Ejecuta estas consultas en el SQL Editor para verificar que todo se creó correctamente:

```sql
-- Verificar que la tabla existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'rib_reporte_tributario_audit_log';

-- Verificar que los triggers fueron creados
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'rib_reporte_tributario_audit%';

-- Verificar las políticas de seguridad
SELECT * FROM pg_policies 
WHERE tablename = 'rib_reporte_tributario_audit_log';
```

Si todas las consultas devuelven resultados, ¡la configuración fue exitosa! ✅

## 🧪 Probar el Audit Log

Después de ejecutar el script:

1. Ve a la aplicación
2. Abre un **RIB Reporte Tributario** existente para editar
3. Modifica algún campo (por ejemplo, un valor de "Total Activos")
4. Guarda los cambios
5. Haz clic en **"Ver Historial de Cambios"**
6. Ahora deberías ver los valores **anteriores** y **nuevos** correctamente

## 📊 Qué Hace el Script

El script realiza las siguientes acciones:

### 1. Crea la Tabla de Audit Log
- Tabla: `rib_reporte_tributario_audit_log`
- Columnas:
  - `id`: Identificador único del log
  - `rib_reporte_tributario_id`: Referencia al reporte
  - `user_id`: Usuario que hizo el cambio
  - `user_email`: Email del usuario
  - `action`: Tipo de acción (created, updated, status_changed, deleted)
  - `changed_fields`: **SOLO** los campos de negocio que cambiaron
  - `old_values`: Valores anteriores **SOLO** de campos que cambiaron
  - `new_values`: Valores nuevos **SOLO** de campos que cambiaron
  - `created_at`: Fecha y hora del cambio

**Campos Monitoreados (SOLO estos se registran):**
- RUC, Año, Tipo de Entidad
- Estado, Solicitud Asociada
- Cuentas por Cobrar del Giro
- Total Activos
- Cuentas por Pagar del Giro
- Total Pasivos
- Capital Pagado
- Total Patrimonio
- Total Pasivo y Patrimonio
- Ingreso por Ventas
- Utilidad Bruta
- Utilidad Antes de Impuesto
- Solvencia
- Gestión

**Campos IGNORADOS (no se registran):**
- `created_at`, `updated_at`, `user_id` (campos de sistema)

### 2. Crea Índices
- Optimiza las consultas por `rib_reporte_tributario_id`
- Optimiza las consultas por fecha
- Optimiza las consultas por usuario

### 3. Configura Row Level Security (RLS)
- Los usuarios autenticados pueden **ver** los logs
- El sistema puede **insertar** logs automáticamente

### 4. Crea la Función Trigger Inteligente
- Detecta INSERT, UPDATE y DELETE en la tabla `rib_reporte_tributario`
- **IGNORA** campos de sistema (`created_at`, `updated_at`, etc.)
- **SOLO** captura cambios en campos de negocio relevantes (17 campos monitoreados)
- Captura el valor anterior y nuevo **únicamente** del campo que cambió
- Identifica automáticamente si el cambio fue de status o actualización general

### 5. Asocia los Triggers
- Trigger para INSERT (cuando se crean registros)
- Trigger para UPDATE (cuando se modifican registros)
- Trigger para DELETE (cuando se eliminan registros)

## 🔍 Comportamiento Actual vs. Nuevo

### ANTES (sin triggers o con triggers que capturan TODO):
```
❌ Muchos campos irrelevantes:
- created_at: 2025-10-15 → 2025-10-16
- updated_at: 2025-10-15 → 2025-10-16
- user_id: abc123 → abc123
- aggregated: N/A → N/A
```

### DESPUÉS (con triggers optimizados):
```
✅ SOLO el campo que realmente cambió:

Campo modificado: Total Activos
Anterior: S/ 1,500,000
Nuevo: S/ 1,750,000
```

**Ventajas:**
- ✅ Historial limpio y claro
- ✅ Solo campos relevantes de negocio
- ✅ Fácil de entender qué cambió exactamente
- ✅ No se registran cambios de campos de sistema

## ⚠️ Notas Importantes

1. **Ejecuta el script UNA SOLA VEZ** por proyecto
2. Si ya ejecutaste el script antes, no hay problema en ejecutarlo nuevamente (usa `CREATE OR REPLACE`)
3. Los logs solo capturarán cambios **después** de ejecutar el script
4. Los cambios históricos anteriores no se pueden recuperar

## 🧹 Ya Ejecuté el Script Anterior y Tengo Muchos Campos?

Si ya ejecutaste una versión anterior del script y ahora ves muchos campos irrelevantes en el historial:

1. **Ejecuta el nuevo script optimizado** (`rib_reporte_tributario_audit_log_setup.sql`)
   - Esto actualizará el trigger para que los **NUEVOS** cambios solo capturen campos relevantes

2. **OPCIONAL: Limpia registros antiguos**
   - Usa el script `limpiar_audit_log_antiguo.sql` para eliminar registros viejos
   - **ADVERTENCIA**: Esto borrará el historial anterior
   - Solo hazlo si quieres empezar con un historial limpio

## 🆘 Troubleshooting

### Problema: "permission denied"
**Solución**: Asegúrate de estar conectado como el propietario del proyecto o tener permisos de administrador.

### Problema: "relation already exists"
**Solución**: El script ya fue ejecutado anteriormente. Puedes continuar sin problemas.

### Problema: Los valores siguen mostrando "N/A"
**Solución**: 
1. Verifica que los triggers se crearon correctamente
2. Cierra sesión y vuelve a iniciar sesión en la aplicación
3. Haz un cambio NUEVO en un reporte (los cambios viejos no se pueden recuperar)

## 📞 Soporte

Si tienes problemas al ejecutar el script o necesitas ayuda adicional, contacta al equipo de desarrollo.

---

**Última actualización**: Octubre 2025
