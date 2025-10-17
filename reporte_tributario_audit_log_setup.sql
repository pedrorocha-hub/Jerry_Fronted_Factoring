-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE REPORTE TRIBUTARIO
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla reporte_tributario
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.reporte_tributario_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporte_tributario_id BIGINT NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reporte_tributario_audit_log_reporte_id 
    ON public.reporte_tributario_audit_log(reporte_tributario_id);

CREATE INDEX IF NOT EXISTS idx_reporte_tributario_audit_log_created_at 
    ON public.reporte_tributario_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reporte_tributario_audit_log_user_id 
    ON public.reporte_tributario_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.reporte_tributario_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view reporte tributario audit logs" ON public.reporte_tributario_audit_log;
DROP POLICY IF EXISTS "System can insert reporte tributario audit logs" ON public.reporte_tributario_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view reporte tributario audit logs" 
    ON public.reporte_tributario_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert reporte tributario audit logs" 
    ON public.reporte_tributario_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.reporte_tributario_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    -- Campos principales que queremos monitorear
    v_monitored_fields TEXT[] := ARRAY[
        'anio_reporte',
        'razon_social',
        'ruc',
        'ruc_estado_contribuyente',
        'ruc_condicion_contribuyente',
        'ruc_actividad_economica',
        -- Renta (campos más importantes)
        'renta_ingresos_netos',
        'renta_otros_ingresos',
        'renta_total_activos_netos',
        'renta_total_cuentas_por_pagar',
        'renta_total_patrimonio',
        'renta_capital_social',
        'renta_resultado_bruto',
        'renta_resultado_antes_participaciones',
        'renta_importe_pagado',
        -- ITAN
        'itan_presento_declaracion',
        'itan_base_imponible',
        'itan_itan_a_pagar',
        -- Ingresos mensuales
        'ingresos_enero',
        'ingresos_febrero',
        'ingresos_marzo',
        'ingresos_abril',
        'ingresos_mayo',
        'ingresos_junio',
        'ingresos_julio',
        'ingresos_agosto',
        'ingresos_setiembre',
        'ingresos_octubre',
        'ingresos_noviembre',
        'ingresos_diciembre',
        -- Ventas totales
        'ventas_total_ingresos',
        'ventas_total_essalud'
    ];
BEGIN
    -- Obtener información del usuario actual
    v_user_id := auth.uid();
    v_user_email := auth.email();

    -- Determinar el tipo de acción
    IF TG_OP = 'INSERT' THEN
        -- NO auditar INSERTs (para evitar ruido cuando se crean registros nuevos)
        RETURN NULL;

    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';

        -- Comparar SOLO los campos que queremos monitorear
        FOREACH v_field IN ARRAY v_monitored_fields LOOP
            IF (
                CASE v_field
                    WHEN 'anio_reporte' THEN OLD.anio_reporte IS DISTINCT FROM NEW.anio_reporte
                    WHEN 'razon_social' THEN OLD.razon_social IS DISTINCT FROM NEW.razon_social
                    WHEN 'ruc' THEN OLD.ruc IS DISTINCT FROM NEW.ruc
                    WHEN 'ruc_estado_contribuyente' THEN OLD.ruc_estado_contribuyente IS DISTINCT FROM NEW.ruc_estado_contribuyente
                    WHEN 'ruc_condicion_contribuyente' THEN OLD.ruc_condicion_contribuyente IS DISTINCT FROM NEW.ruc_condicion_contribuyente
                    WHEN 'ruc_actividad_economica' THEN OLD.ruc_actividad_economica IS DISTINCT FROM NEW.ruc_actividad_economica
                    -- Renta
                    WHEN 'renta_ingresos_netos' THEN OLD.renta_ingresos_netos IS DISTINCT FROM NEW.renta_ingresos_netos
                    WHEN 'renta_otros_ingresos' THEN OLD.renta_otros_ingresos IS DISTINCT FROM NEW.renta_otros_ingresos
                    WHEN 'renta_total_activos_netos' THEN OLD.renta_total_activos_netos IS DISTINCT FROM NEW.renta_total_activos_netos
                    WHEN 'renta_total_cuentas_por_pagar' THEN OLD.renta_total_cuentas_por_pagar IS DISTINCT FROM NEW.renta_total_cuentas_por_pagar
                    WHEN 'renta_total_patrimonio' THEN OLD.renta_total_patrimonio IS DISTINCT FROM NEW.renta_total_patrimonio
                    WHEN 'renta_capital_social' THEN OLD.renta_capital_social IS DISTINCT FROM NEW.renta_capital_social
                    WHEN 'renta_resultado_bruto' THEN OLD.renta_resultado_bruto IS DISTINCT FROM NEW.renta_resultado_bruto
                    WHEN 'renta_resultado_antes_participaciones' THEN OLD.renta_resultado_antes_participaciones IS DISTINCT FROM NEW.renta_resultado_antes_participaciones
                    WHEN 'renta_importe_pagado' THEN OLD.renta_importe_pagado IS DISTINCT FROM NEW.renta_importe_pagado
                    -- ITAN
                    WHEN 'itan_presento_declaracion' THEN OLD.itan_presento_declaracion IS DISTINCT FROM NEW.itan_presento_declaracion
                    WHEN 'itan_base_imponible' THEN OLD.itan_base_imponible IS DISTINCT FROM NEW.itan_base_imponible
                    WHEN 'itan_itan_a_pagar' THEN OLD.itan_itan_a_pagar IS DISTINCT FROM NEW.itan_itan_a_pagar
                    -- Ingresos
                    WHEN 'ingresos_enero' THEN OLD.ingresos_enero IS DISTINCT FROM NEW.ingresos_enero
                    WHEN 'ingresos_febrero' THEN OLD.ingresos_febrero IS DISTINCT FROM NEW.ingresos_febrero
                    WHEN 'ingresos_marzo' THEN OLD.ingresos_marzo IS DISTINCT FROM NEW.ingresos_marzo
                    WHEN 'ingresos_abril' THEN OLD.ingresos_abril IS DISTINCT FROM NEW.ingresos_abril
                    WHEN 'ingresos_mayo' THEN OLD.ingresos_mayo IS DISTINCT FROM NEW.ingresos_mayo
                    WHEN 'ingresos_junio' THEN OLD.ingresos_junio IS DISTINCT FROM NEW.ingresos_junio
                    WHEN 'ingresos_julio' THEN OLD.ingresos_julio IS DISTINCT FROM NEW.ingresos_julio
                    WHEN 'ingresos_agosto' THEN OLD.ingresos_agosto IS DISTINCT FROM NEW.ingresos_agosto
                    WHEN 'ingresos_setiembre' THEN OLD.ingresos_setiembre IS DISTINCT FROM NEW.ingresos_setiembre
                    WHEN 'ingresos_octubre' THEN OLD.ingresos_octubre IS DISTINCT FROM NEW.ingresos_octubre
                    WHEN 'ingresos_noviembre' THEN OLD.ingresos_noviembre IS DISTINCT FROM NEW.ingresos_noviembre
                    WHEN 'ingresos_diciembre' THEN OLD.ingresos_diciembre IS DISTINCT FROM NEW.ingresos_diciembre
                    -- Ventas
                    WHEN 'ventas_total_ingresos' THEN OLD.ventas_total_ingresos IS DISTINCT FROM NEW.ventas_total_ingresos
                    WHEN 'ventas_total_essalud' THEN OLD.ventas_total_essalud IS DISTINCT FROM NEW.ventas_total_essalud
                    ELSE FALSE
                END
            ) THEN
                -- Marcar el campo como cambiado
                v_changed_fields := v_changed_fields || jsonb_build_object(v_field, true);
                
                -- Guardar valor anterior y nuevo (siempre incluir el año para referencia)
                v_old_values := v_old_values || jsonb_build_object('anio_reporte', to_jsonb(OLD.anio_reporte));
                v_old_values := v_old_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'anio_reporte' THEN to_jsonb(OLD.anio_reporte)
                        WHEN 'razon_social' THEN to_jsonb(OLD.razon_social)
                        WHEN 'ruc' THEN to_jsonb(OLD.ruc)
                        WHEN 'ruc_estado_contribuyente' THEN to_jsonb(OLD.ruc_estado_contribuyente)
                        WHEN 'ruc_condicion_contribuyente' THEN to_jsonb(OLD.ruc_condicion_contribuyente)
                        WHEN 'ruc_actividad_economica' THEN to_jsonb(OLD.ruc_actividad_economica)
                        -- Renta
                        WHEN 'renta_ingresos_netos' THEN to_jsonb(OLD.renta_ingresos_netos)
                        WHEN 'renta_otros_ingresos' THEN to_jsonb(OLD.renta_otros_ingresos)
                        WHEN 'renta_total_activos_netos' THEN to_jsonb(OLD.renta_total_activos_netos)
                        WHEN 'renta_total_cuentas_por_pagar' THEN to_jsonb(OLD.renta_total_cuentas_por_pagar)
                        WHEN 'renta_total_patrimonio' THEN to_jsonb(OLD.renta_total_patrimonio)
                        WHEN 'renta_capital_social' THEN to_jsonb(OLD.renta_capital_social)
                        WHEN 'renta_resultado_bruto' THEN to_jsonb(OLD.renta_resultado_bruto)
                        WHEN 'renta_resultado_antes_participaciones' THEN to_jsonb(OLD.renta_resultado_antes_participaciones)
                        WHEN 'renta_importe_pagado' THEN to_jsonb(OLD.renta_importe_pagado)
                        -- ITAN
                        WHEN 'itan_presento_declaracion' THEN to_jsonb(OLD.itan_presento_declaracion)
                        WHEN 'itan_base_imponible' THEN to_jsonb(OLD.itan_base_imponible)
                        WHEN 'itan_itan_a_pagar' THEN to_jsonb(OLD.itan_itan_a_pagar)
                        -- Ingresos
                        WHEN 'ingresos_enero' THEN to_jsonb(OLD.ingresos_enero)
                        WHEN 'ingresos_febrero' THEN to_jsonb(OLD.ingresos_febrero)
                        WHEN 'ingresos_marzo' THEN to_jsonb(OLD.ingresos_marzo)
                        WHEN 'ingresos_abril' THEN to_jsonb(OLD.ingresos_abril)
                        WHEN 'ingresos_mayo' THEN to_jsonb(OLD.ingresos_mayo)
                        WHEN 'ingresos_junio' THEN to_jsonb(OLD.ingresos_junio)
                        WHEN 'ingresos_julio' THEN to_jsonb(OLD.ingresos_julio)
                        WHEN 'ingresos_agosto' THEN to_jsonb(OLD.ingresos_agosto)
                        WHEN 'ingresos_setiembre' THEN to_jsonb(OLD.ingresos_setiembre)
                        WHEN 'ingresos_octubre' THEN to_jsonb(OLD.ingresos_octubre)
                        WHEN 'ingresos_noviembre' THEN to_jsonb(OLD.ingresos_noviembre)
                        WHEN 'ingresos_diciembre' THEN to_jsonb(OLD.ingresos_diciembre)
                        -- Ventas
                        WHEN 'ventas_total_ingresos' THEN to_jsonb(OLD.ventas_total_ingresos)
                        WHEN 'ventas_total_essalud' THEN to_jsonb(OLD.ventas_total_essalud)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object('anio_reporte', to_jsonb(NEW.anio_reporte));
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'anio_reporte' THEN to_jsonb(NEW.anio_reporte)
                        WHEN 'razon_social' THEN to_jsonb(NEW.razon_social)
                        WHEN 'ruc' THEN to_jsonb(NEW.ruc)
                        WHEN 'ruc_estado_contribuyente' THEN to_jsonb(NEW.ruc_estado_contribuyente)
                        WHEN 'ruc_condicion_contribuyente' THEN to_jsonb(NEW.ruc_condicion_contribuyente)
                        WHEN 'ruc_actividad_economica' THEN to_jsonb(NEW.ruc_actividad_economica)
                        -- Renta
                        WHEN 'renta_ingresos_netos' THEN to_jsonb(NEW.renta_ingresos_netos)
                        WHEN 'renta_otros_ingresos' THEN to_jsonb(NEW.renta_otros_ingresos)
                        WHEN 'renta_total_activos_netos' THEN to_jsonb(NEW.renta_total_activos_netos)
                        WHEN 'renta_total_cuentas_por_pagar' THEN to_jsonb(NEW.renta_total_cuentas_por_pagar)
                        WHEN 'renta_total_patrimonio' THEN to_jsonb(NEW.renta_total_patrimonio)
                        WHEN 'renta_capital_social' THEN to_jsonb(NEW.renta_capital_social)
                        WHEN 'renta_resultado_bruto' THEN to_jsonb(NEW.renta_resultado_bruto)
                        WHEN 'renta_resultado_antes_participaciones' THEN to_jsonb(NEW.renta_resultado_antes_participaciones)
                        WHEN 'renta_importe_pagado' THEN to_jsonb(NEW.renta_importe_pagado)
                        -- ITAN
                        WHEN 'itan_presento_declaracion' THEN to_jsonb(NEW.itan_presento_declaracion)
                        WHEN 'itan_base_imponible' THEN to_jsonb(NEW.itan_base_imponible)
                        WHEN 'itan_itan_a_pagar' THEN to_jsonb(NEW.itan_itan_a_pagar)
                        -- Ingresos
                        WHEN 'ingresos_enero' THEN to_jsonb(NEW.ingresos_enero)
                        WHEN 'ingresos_febrero' THEN to_jsonb(NEW.ingresos_febrero)
                        WHEN 'ingresos_marzo' THEN to_jsonb(NEW.ingresos_marzo)
                        WHEN 'ingresos_abril' THEN to_jsonb(NEW.ingresos_abril)
                        WHEN 'ingresos_mayo' THEN to_jsonb(NEW.ingresos_mayo)
                        WHEN 'ingresos_junio' THEN to_jsonb(NEW.ingresos_junio)
                        WHEN 'ingresos_julio' THEN to_jsonb(NEW.ingresos_julio)
                        WHEN 'ingresos_agosto' THEN to_jsonb(NEW.ingresos_agosto)
                        WHEN 'ingresos_setiembre' THEN to_jsonb(NEW.ingresos_setiembre)
                        WHEN 'ingresos_octubre' THEN to_jsonb(NEW.ingresos_octubre)
                        WHEN 'ingresos_noviembre' THEN to_jsonb(NEW.ingresos_noviembre)
                        WHEN 'ingresos_diciembre' THEN to_jsonb(NEW.ingresos_diciembre)
                        -- Ventas
                        WHEN 'ventas_total_ingresos' THEN to_jsonb(NEW.ventas_total_ingresos)
                        WHEN 'ventas_total_essalud' THEN to_jsonb(NEW.ventas_total_essalud)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.reporte_tributario_audit_log (
                reporte_tributario_id,
                user_id,
                user_email,
                action,
                changed_fields,
                old_values,
                new_values
            ) VALUES (
                NEW.id,
                v_user_id,
                v_user_email,
                v_action,
                v_changed_fields,
                v_old_values,
                v_new_values
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        -- NO auditar DELETEs (para evitar ruido cuando se eliminan registros)
        RETURN NULL;
    END IF;

    RETURN NULL; -- Para triggers AFTER, el valor de retorno se ignora
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear los triggers en la tabla reporte_tributario
DROP TRIGGER IF EXISTS reporte_tributario_audit_insert ON public.reporte_tributario;
CREATE TRIGGER reporte_tributario_audit_insert
    AFTER INSERT ON public.reporte_tributario
    FOR EACH ROW
    EXECUTE FUNCTION public.reporte_tributario_audit_trigger();

DROP TRIGGER IF EXISTS reporte_tributario_audit_update ON public.reporte_tributario;
CREATE TRIGGER reporte_tributario_audit_update
    AFTER UPDATE ON public.reporte_tributario
    FOR EACH ROW
    EXECUTE FUNCTION public.reporte_tributario_audit_trigger();

DROP TRIGGER IF EXISTS reporte_tributario_audit_delete ON public.reporte_tributario;
CREATE TRIGGER reporte_tributario_audit_delete
    AFTER DELETE ON public.reporte_tributario
    FOR EACH ROW
    EXECUTE FUNCTION public.reporte_tributario_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'reporte_tributario_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'reporte_tributario_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'reporte_tributario_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================

