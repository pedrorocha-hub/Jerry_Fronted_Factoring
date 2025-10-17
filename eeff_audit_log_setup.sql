-- ==================================================================
-- SCRIPT DE CONFIGURACIÓN PARA AUDIT LOG DE EEFF
-- ==================================================================
-- Este script crea la tabla de audit log y los triggers necesarios
-- para registrar todos los cambios en la tabla eeff
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script
-- 4. Ejecuta el script
-- ==================================================================

-- Paso 1: Crear la tabla de audit log
CREATE TABLE IF NOT EXISTS public.eeff_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    eeff_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_eeff_audit_log_eeff_id 
    ON public.eeff_audit_log(eeff_id);

CREATE INDEX IF NOT EXISTS idx_eeff_audit_log_created_at 
    ON public.eeff_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_eeff_audit_log_user_id 
    ON public.eeff_audit_log(user_id);

-- Paso 3: Habilitar Row Level Security (RLS)
ALTER TABLE public.eeff_audit_log ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear políticas de acceso
-- Primero eliminamos las políticas si existen (para permitir re-ejecución del script)
DROP POLICY IF EXISTS "Users can view eeff audit logs" ON public.eeff_audit_log;
DROP POLICY IF EXISTS "System can insert eeff audit logs" ON public.eeff_audit_log;

-- Política para SELECT: usuarios autenticados pueden ver los logs
CREATE POLICY "Users can view eeff audit logs" 
    ON public.eeff_audit_log
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: solo el sistema puede insertar logs (via triggers)
CREATE POLICY "System can insert eeff audit logs" 
    ON public.eeff_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Paso 5: Crear la función trigger para capturar cambios
CREATE OR REPLACE FUNCTION public.eeff_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
    v_field TEXT;
    -- Campos de negocio que queremos monitorear
    v_monitored_fields TEXT[] := ARRAY[
        'ruc',
        'anio_reporte',
        -- Activos principales
        'activo_efectivo_y_equivalentes_de_efectivo',
        'activo_inversiones_financieras',
        'activo_ctas_por_cobrar_comerciales_terceros',
        'activo_ctas_por_cobrar_comerciales_relacionadas',
        'activo_mercaderias',
        'activo_productos_terminados',
        'activo_materias_primas',
        'activo_propiedades_planta_y_equipo',
        'activo_total_activo_neto',
        -- Pasivos principales
        'pasivo_sobregiros_bancarios',
        'pasivo_ctas_por_pagar_comerciales_terceros',
        'pasivo_ctas_por_pagar_comerciales_relacionadas',
        'pasivo_obligaciones_financieras',
        'pasivo_total_pasivo',
        -- Patrimonio principales
        'patrimonio_capital',
        'patrimonio_reservas',
        'patrimonio_resultados_acumulados_positivos',
        'patrimonio_resultados_acumulados_negativos',
        'patrimonio_utilidad_de_ejercicio',
        'patrimonio_perdida_de_ejercicio',
        'patrimonio_total_patrimonio',
        'patrimonio_total_pasivo_y_patrimonio'
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
            -- Usar EXECUTE para comparar dinámicamente los campos
            IF (
                CASE v_field
                    WHEN 'ruc' THEN OLD.ruc IS DISTINCT FROM NEW.ruc
                    WHEN 'anio_reporte' THEN OLD.anio_reporte IS DISTINCT FROM NEW.anio_reporte
                    -- Activos
                    WHEN 'activo_efectivo_y_equivalentes_de_efectivo' THEN OLD.activo_efectivo_y_equivalentes_de_efectivo IS DISTINCT FROM NEW.activo_efectivo_y_equivalentes_de_efectivo
                    WHEN 'activo_inversiones_financieras' THEN OLD.activo_inversiones_financieras IS DISTINCT FROM NEW.activo_inversiones_financieras
                    WHEN 'activo_ctas_por_cobrar_comerciales_terceros' THEN OLD.activo_ctas_por_cobrar_comerciales_terceros IS DISTINCT FROM NEW.activo_ctas_por_cobrar_comerciales_terceros
                    WHEN 'activo_ctas_por_cobrar_comerciales_relacionadas' THEN OLD.activo_ctas_por_cobrar_comerciales_relacionadas IS DISTINCT FROM NEW.activo_ctas_por_cobrar_comerciales_relacionadas
                    WHEN 'activo_mercaderias' THEN OLD.activo_mercaderias IS DISTINCT FROM NEW.activo_mercaderias
                    WHEN 'activo_productos_terminados' THEN OLD.activo_productos_terminados IS DISTINCT FROM NEW.activo_productos_terminados
                    WHEN 'activo_materias_primas' THEN OLD.activo_materias_primas IS DISTINCT FROM NEW.activo_materias_primas
                    WHEN 'activo_propiedades_planta_y_equipo' THEN OLD.activo_propiedades_planta_y_equipo IS DISTINCT FROM NEW.activo_propiedades_planta_y_equipo
                    WHEN 'activo_total_activo_neto' THEN OLD.activo_total_activo_neto IS DISTINCT FROM NEW.activo_total_activo_neto
                    -- Pasivos
                    WHEN 'pasivo_sobregiros_bancarios' THEN OLD.pasivo_sobregiros_bancarios IS DISTINCT FROM NEW.pasivo_sobregiros_bancarios
                    WHEN 'pasivo_ctas_por_pagar_comerciales_terceros' THEN OLD.pasivo_ctas_por_pagar_comerciales_terceros IS DISTINCT FROM NEW.pasivo_ctas_por_pagar_comerciales_terceros
                    WHEN 'pasivo_ctas_por_pagar_comerciales_relacionadas' THEN OLD.pasivo_ctas_por_pagar_comerciales_relacionadas IS DISTINCT FROM NEW.pasivo_ctas_por_pagar_comerciales_relacionadas
                    WHEN 'pasivo_obligaciones_financieras' THEN OLD.pasivo_obligaciones_financieras IS DISTINCT FROM NEW.pasivo_obligaciones_financieras
                    WHEN 'pasivo_total_pasivo' THEN OLD.pasivo_total_pasivo IS DISTINCT FROM NEW.pasivo_total_pasivo
                    -- Patrimonio
                    WHEN 'patrimonio_capital' THEN OLD.patrimonio_capital IS DISTINCT FROM NEW.patrimonio_capital
                    WHEN 'patrimonio_reservas' THEN OLD.patrimonio_reservas IS DISTINCT FROM NEW.patrimonio_reservas
                    WHEN 'patrimonio_resultados_acumulados_positivos' THEN OLD.patrimonio_resultados_acumulados_positivos IS DISTINCT FROM NEW.patrimonio_resultados_acumulados_positivos
                    WHEN 'patrimonio_resultados_acumulados_negativos' THEN OLD.patrimonio_resultados_acumulados_negativos IS DISTINCT FROM NEW.patrimonio_resultados_acumulados_negativos
                    WHEN 'patrimonio_utilidad_de_ejercicio' THEN OLD.patrimonio_utilidad_de_ejercicio IS DISTINCT FROM NEW.patrimonio_utilidad_de_ejercicio
                    WHEN 'patrimonio_perdida_de_ejercicio' THEN OLD.patrimonio_perdida_de_ejercicio IS DISTINCT FROM NEW.patrimonio_perdida_de_ejercicio
                    WHEN 'patrimonio_total_patrimonio' THEN OLD.patrimonio_total_patrimonio IS DISTINCT FROM NEW.patrimonio_total_patrimonio
                    WHEN 'patrimonio_total_pasivo_y_patrimonio' THEN OLD.patrimonio_total_pasivo_y_patrimonio IS DISTINCT FROM NEW.patrimonio_total_pasivo_y_patrimonio
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
                        WHEN 'ruc' THEN to_jsonb(OLD.ruc)
                        WHEN 'anio_reporte' THEN to_jsonb(OLD.anio_reporte)
                        -- Activos
                        WHEN 'activo_efectivo_y_equivalentes_de_efectivo' THEN to_jsonb(OLD.activo_efectivo_y_equivalentes_de_efectivo)
                        WHEN 'activo_inversiones_financieras' THEN to_jsonb(OLD.activo_inversiones_financieras)
                        WHEN 'activo_ctas_por_cobrar_comerciales_terceros' THEN to_jsonb(OLD.activo_ctas_por_cobrar_comerciales_terceros)
                        WHEN 'activo_ctas_por_cobrar_comerciales_relacionadas' THEN to_jsonb(OLD.activo_ctas_por_cobrar_comerciales_relacionadas)
                        WHEN 'activo_mercaderias' THEN to_jsonb(OLD.activo_mercaderias)
                        WHEN 'activo_productos_terminados' THEN to_jsonb(OLD.activo_productos_terminados)
                        WHEN 'activo_materias_primas' THEN to_jsonb(OLD.activo_materias_primas)
                        WHEN 'activo_propiedades_planta_y_equipo' THEN to_jsonb(OLD.activo_propiedades_planta_y_equipo)
                        WHEN 'activo_total_activo_neto' THEN to_jsonb(OLD.activo_total_activo_neto)
                        -- Pasivos
                        WHEN 'pasivo_sobregiros_bancarios' THEN to_jsonb(OLD.pasivo_sobregiros_bancarios)
                        WHEN 'pasivo_ctas_por_pagar_comerciales_terceros' THEN to_jsonb(OLD.pasivo_ctas_por_pagar_comerciales_terceros)
                        WHEN 'pasivo_ctas_por_pagar_comerciales_relacionadas' THEN to_jsonb(OLD.pasivo_ctas_por_pagar_comerciales_relacionadas)
                        WHEN 'pasivo_obligaciones_financieras' THEN to_jsonb(OLD.pasivo_obligaciones_financieras)
                        WHEN 'pasivo_total_pasivo' THEN to_jsonb(OLD.pasivo_total_pasivo)
                        -- Patrimonio
                        WHEN 'patrimonio_capital' THEN to_jsonb(OLD.patrimonio_capital)
                        WHEN 'patrimonio_reservas' THEN to_jsonb(OLD.patrimonio_reservas)
                        WHEN 'patrimonio_resultados_acumulados_positivos' THEN to_jsonb(OLD.patrimonio_resultados_acumulados_positivos)
                        WHEN 'patrimonio_resultados_acumulados_negativos' THEN to_jsonb(OLD.patrimonio_resultados_acumulados_negativos)
                        WHEN 'patrimonio_utilidad_de_ejercicio' THEN to_jsonb(OLD.patrimonio_utilidad_de_ejercicio)
                        WHEN 'patrimonio_perdida_de_ejercicio' THEN to_jsonb(OLD.patrimonio_perdida_de_ejercicio)
                        WHEN 'patrimonio_total_patrimonio' THEN to_jsonb(OLD.patrimonio_total_patrimonio)
                        WHEN 'patrimonio_total_pasivo_y_patrimonio' THEN to_jsonb(OLD.patrimonio_total_pasivo_y_patrimonio)
                    END
                );
                
                v_new_values := v_new_values || jsonb_build_object('anio_reporte', to_jsonb(NEW.anio_reporte));
                v_new_values := v_new_values || jsonb_build_object(
                    v_field,
                    CASE v_field
                        WHEN 'ruc' THEN to_jsonb(NEW.ruc)
                        WHEN 'anio_reporte' THEN to_jsonb(NEW.anio_reporte)
                        -- Activos
                        WHEN 'activo_efectivo_y_equivalentes_de_efectivo' THEN to_jsonb(NEW.activo_efectivo_y_equivalentes_de_efectivo)
                        WHEN 'activo_inversiones_financieras' THEN to_jsonb(NEW.activo_inversiones_financieras)
                        WHEN 'activo_ctas_por_cobrar_comerciales_terceros' THEN to_jsonb(NEW.activo_ctas_por_cobrar_comerciales_terceros)
                        WHEN 'activo_ctas_por_cobrar_comerciales_relacionadas' THEN to_jsonb(NEW.activo_ctas_por_cobrar_comerciales_relacionadas)
                        WHEN 'activo_mercaderias' THEN to_jsonb(NEW.activo_mercaderias)
                        WHEN 'activo_productos_terminados' THEN to_jsonb(NEW.activo_productos_terminados)
                        WHEN 'activo_materias_primas' THEN to_jsonb(NEW.activo_materias_primas)
                        WHEN 'activo_propiedades_planta_y_equipo' THEN to_jsonb(NEW.activo_propiedades_planta_y_equipo)
                        WHEN 'activo_total_activo_neto' THEN to_jsonb(NEW.activo_total_activo_neto)
                        -- Pasivos
                        WHEN 'pasivo_sobregiros_bancarios' THEN to_jsonb(NEW.pasivo_sobregiros_bancarios)
                        WHEN 'pasivo_ctas_por_pagar_comerciales_terceros' THEN to_jsonb(NEW.pasivo_ctas_por_pagar_comerciales_terceros)
                        WHEN 'pasivo_ctas_por_pagar_comerciales_relacionadas' THEN to_jsonb(NEW.pasivo_ctas_por_pagar_comerciales_relacionadas)
                        WHEN 'pasivo_obligaciones_financieras' THEN to_jsonb(NEW.pasivo_obligaciones_financieras)
                        WHEN 'pasivo_total_pasivo' THEN to_jsonb(NEW.pasivo_total_pasivo)
                        -- Patrimonio
                        WHEN 'patrimonio_capital' THEN to_jsonb(NEW.patrimonio_capital)
                        WHEN 'patrimonio_reservas' THEN to_jsonb(NEW.patrimonio_reservas)
                        WHEN 'patrimonio_resultados_acumulados_positivos' THEN to_jsonb(NEW.patrimonio_resultados_acumulados_positivos)
                        WHEN 'patrimonio_resultados_acumulados_negativos' THEN to_jsonb(NEW.patrimonio_resultados_acumulados_negativos)
                        WHEN 'patrimonio_utilidad_de_ejercicio' THEN to_jsonb(NEW.patrimonio_utilidad_de_ejercicio)
                        WHEN 'patrimonio_perdida_de_ejercicio' THEN to_jsonb(NEW.patrimonio_perdida_de_ejercicio)
                        WHEN 'patrimonio_total_patrimonio' THEN to_jsonb(NEW.patrimonio_total_patrimonio)
                        WHEN 'patrimonio_total_pasivo_y_patrimonio' THEN to_jsonb(NEW.patrimonio_total_pasivo_y_patrimonio)
                    END
                );
            END IF;
        END LOOP;

        -- Solo insertar log si hubo cambios en campos monitoreados
        IF v_changed_fields <> '{}'::JSONB THEN
            INSERT INTO public.eeff_audit_log (
                eeff_id,
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

-- Paso 6: Crear los triggers en la tabla eeff
DROP TRIGGER IF EXISTS eeff_audit_insert ON public.eeff;
CREATE TRIGGER eeff_audit_insert
    AFTER INSERT ON public.eeff
    FOR EACH ROW
    EXECUTE FUNCTION public.eeff_audit_trigger();

DROP TRIGGER IF EXISTS eeff_audit_update ON public.eeff;
CREATE TRIGGER eeff_audit_update
    AFTER UPDATE ON public.eeff
    FOR EACH ROW
    EXECUTE FUNCTION public.eeff_audit_trigger();

DROP TRIGGER IF EXISTS eeff_audit_delete ON public.eeff;
CREATE TRIGGER eeff_audit_delete
    AFTER DELETE ON public.eeff
    FOR EACH ROW
    EXECUTE FUNCTION public.eeff_audit_trigger();

-- ==================================================================
-- VERIFICACIÓN
-- ==================================================================
-- Ejecuta estas consultas para verificar que todo se creó correctamente:

-- Ver la tabla creada
-- SELECT * FROM information_schema.tables WHERE table_name = 'eeff_audit_log';

-- Ver los triggers creados
-- SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'eeff_audit%';

-- Ver políticas de RLS
-- SELECT * FROM pg_policies WHERE tablename = 'eeff_audit_log';

-- ==================================================================
-- SCRIPT COMPLETADO
-- ==================================================================

