# Migración: Crear función get_rib_eeff_summaries

## Propósito
Crear una función SQL que devuelva un resumen mejorado de todos los reportes RIB EEFF con información completa de proveedor, deudor y solicitud asociada.

## Características
- ✅ Devuelve información de **Proveedor** (RUC y nombre)
- ✅ Devuelve información de **Deudor** (RUC y nombre) si existe
- ✅ Incluye información de **Solicitud Asociada** con label descriptivo
- ✅ Muestra **años reportados** en formato legible (ej: "2024, 2023, 2022")
- ✅ Incluye nombre del **creador** desde la tabla `profiles`
- ✅ Maneja correctamente nombres manuales vs. nombres de `ficha_ruc`
- ✅ Ordena por fecha de actualización más reciente

## Estructura de Datos Retornados

```typescript
{
  id: UUID,                           // ID único del reporte
  proveedor_ruc: string,              // RUC del proveedor
  proveedor_nombre: string,           // Nombre del proveedor
  deudor_ruc: string,                 // RUC del deudor o "N/A"
  deudor_nombre: string,              // Nombre del deudor o "Sin deudor"
  updated_at: timestamp,              // Última actualización
  status: string,                     // Estado: Borrador/En revision/Completado
  creator_name: string,               // Nombre del creador
  solicitud_id: UUID,                 // ID de solicitud asociada (nullable)
  solicitud_label: string,            // Label descriptivo: "Empresa - DD/MM/YYYY"
  años_reportados: string             // Años separados por coma: "2024, 2023, 2022"
}
```

## Lógica Implementada

### 1. Agregación por Proveedor
```sql
proveedor_data AS (
  SELECT 
    re.id,
    re.ruc as proveedor_ruc,
    COALESCE(fr_prov.nombre_empresa, 'Sin información') as proveedor_nombre,
    MAX(re.updated_at) as updated_at,
    (ARRAY_AGG(re.status ORDER BY re.updated_at DESC))[1] as status,
    ARRAY_AGG(DISTINCT re.anio_reporte ORDER BY re.anio_reporte DESC) as años
  FROM rib_eeff re
  LEFT JOIN ficha_ruc fr_prov ON re.ruc = fr_prov.ruc
  WHERE re.tipo_entidad = 'proveedor'
  GROUP BY re.id, re.ruc, fr_prov.nombre_empresa, re.solicitud_id
)
```

### 2. Agregación por Deudor
```sql
deudor_data AS (
  SELECT 
    re.id,
    re.ruc as deudor_ruc,
    COALESCE(fr_deud.nombre_empresa, 'Sin información') as deudor_nombre
  FROM rib_eeff re
  LEFT JOIN ficha_ruc fr_deud ON re.ruc = fr_deud.ruc
  WHERE re.tipo_entidad = 'deudor'
  GROUP BY re.id, re.ruc, fr_deud.nombre_empresa
)
```

### 3. Información de Solicitud
```sql
solicitud_info AS (
  SELECT 
    so.id as solicitud_id,
    CONCAT(
      COALESCE(fr_sol.nombre_empresa, so.ruc),
      ' - ',
      TO_CHAR(so.created_at, 'DD/MM/YYYY')
    ) as solicitud_label
  FROM solicitudes_operacion so
  LEFT JOIN ficha_ruc fr_sol ON so.ruc = fr_sol.ruc
)
```

### 4. Join Final
- Une proveedor con deudor por `id`
- Une con información del creador (`profiles`)
- Une con información de solicitud
- Convierte array de años a string: "2024, 2023, 2022"

## Ejecución

### Opción 1: Supabase CLI (Recomendado)
```bash
cd c:\Users\Maxi\dyad-apps\Jerry_Fronted_Factoring
supabase db push
```

### Opción 2: SQL Editor en Dashboard
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `create_get_rib_eeff_summaries_function.sql`
3. Ejecuta la query

### Opción 3: psql
```bash
psql -h <host> -d <database> -U <user> -f supabase/migrations/create_get_rib_eeff_summaries_function.sql
```

## Verificación

```sql
-- Prueba la función
SELECT * FROM get_rib_eeff_summaries();

-- Ejemplo de salida esperada:
-- id | proveedor_ruc | proveedor_nombre | deudor_ruc | deudor_nombre | años_reportados
-- ---|---------------|------------------|------------|---------------|------------------
-- 123| 20556964620   | ACME CORP        | 20123456789| XYZ S.A.     | 2024, 2023, 2022
```

## Rollback (si es necesario)

```sql
DROP FUNCTION IF EXISTS get_rib_eeff_summaries();
```

## Cambios en el Frontend

La página `src/pages/RibEeff.tsx` ahora muestra:

### Columnas Nuevas:
- **Proveedor**: Nombre + RUC con icono 🏢 verde
- **Deudor**: Nombre + RUC con icono 👤 azul (o "Sin deudor" si no existe)
- **Solicitud Asociada**: Link clickeable con label descriptivo
- **Años**: Lista de años reportados (ej: "2024, 2023, 2022")
- **Estado**: Badge de estado
- **Creador**: Nombre del usuario que creó el reporte
- **Actualización**: Fecha de última modificación

### UI Mejorada:
- Hover effect en filas
- Iconos visuales para proveedor (verde) y deudor (azul)
- Links clickeables a solicitudes
- Información más compacta y legible
- Truncado de texto largo con tooltips

## Notas
- La función usa `SECURITY DEFINER` para acceder a todas las tablas necesarias
- Los reportes sin deudor muestran "N/A" y "Sin deudor"
- Los reportes sin solicitud muestran "N/A"
- Los años se ordenan descendente (más reciente primero)
- El status se toma del registro más reciente

