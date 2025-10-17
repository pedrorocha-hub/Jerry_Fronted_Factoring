-- ==================================================================
-- SCRIPT COMPLETO DE AUDIT LOG PARA REPORTE TRIBUTARIO
-- ==================================================================
-- Este script trackea TODOS los campos de reporte_tributario (61 campos)
-- ==================================================================

-- PASO 1: Limpiar instalación anterior (si existe)
DROP TRIGGER IF EXISTS reporte_tributario_audit_insert ON public.reporte_tributario;
DROP TRIGGER IF EXISTS reporte_tributario_audit_update ON public.reporte_tributario;
DROP TRIGGER IF EXISTS reporte_tributario_audit_delete ON public.reporte_tributario;
DROP FUNCTION IF EXISTS public.reporte_tributario_audit_trigger();
DROP TABLE IF EXISTS public.reporte_tributario_audit_log CASCADE;

-- PASO 2: Crear la tabla de audit log
CREATE TABLE public.reporte_tributario_audit_log (
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

-- PASO 3: Crear índices
CREATE INDEX idx_reporte_tributario_audit_log_reporte_id 
    ON public.reporte_tributario_audit_log(reporte_tributario_id);
CREATE INDEX idx_reporte_tributario_audit_log_created_at 
    ON public.reporte_tributario_audit_log(created_at DESC);
CREATE INDEX idx_reporte_tributario_audit_log_user_id 
    ON public.reporte_tributario_audit_log(user_id);

-- PASO 4: Habilitar RLS
ALTER TABLE public.reporte_tributario_audit_log ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas RLS
CREATE POLICY "Users can view reporte tributario audit logs" 
    ON public.reporte_tributario_audit_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert reporte tributario audit logs" 
    ON public.reporte_tributario_audit_log
    FOR INSERT TO authenticated WITH CHECK (true);

-- PASO 6: Crear función trigger que trackea TODOS los campos
CREATE OR REPLACE FUNCTION public.reporte_tributario_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_action TEXT;
    v_changed_fields JSONB := '{}'::JSONB;
    v_old_values JSONB := '{}'::JSONB;
    v_new_values JSONB := '{}'::JSONB;
BEGIN
    v_user_id := auth.uid();
    v_user_email := auth.email();

    IF TG_OP = 'INSERT' THEN
        RETURN NULL; -- No auditar INSERTs
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';

        -- Comparar TODOS los campos (61 campos)
        
        -- General
        IF OLD.anio_reporte IS DISTINCT FROM NEW.anio_reporte THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('anio_reporte', true);
            v_old_values := v_old_values || jsonb_build_object('anio_reporte', to_jsonb(OLD.anio_reporte));
            v_new_values := v_new_values || jsonb_build_object('anio_reporte', to_jsonb(NEW.anio_reporte));
        END IF;
        IF OLD.razon_social IS DISTINCT FROM NEW.razon_social THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('razon_social', true);
            v_old_values := v_old_values || jsonb_build_object('razon_social', to_jsonb(OLD.razon_social));
            v_new_values := v_new_values || jsonb_build_object('razon_social', to_jsonb(NEW.razon_social));
        END IF;
        IF OLD.ruc IS DISTINCT FROM NEW.ruc THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc', true);
            v_old_values := v_old_values || jsonb_build_object('ruc', to_jsonb(OLD.ruc));
            v_new_values := v_new_values || jsonb_build_object('ruc', to_jsonb(NEW.ruc));
        END IF;
        IF OLD.fecha_emision IS DISTINCT FROM NEW.fecha_emision THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('fecha_emision', true);
            v_old_values := v_old_values || jsonb_build_object('fecha_emision', to_jsonb(OLD.fecha_emision));
            v_new_values := v_new_values || jsonb_build_object('fecha_emision', to_jsonb(NEW.fecha_emision));
        END IF;

        -- RUC (10 campos)
        IF OLD.ruc_fecha_informacion IS DISTINCT FROM NEW.ruc_fecha_informacion THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_fecha_informacion', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_fecha_informacion', to_jsonb(OLD.ruc_fecha_informacion));
            v_new_values := v_new_values || jsonb_build_object('ruc_fecha_informacion', to_jsonb(NEW.ruc_fecha_informacion));
        END IF;
        IF OLD.ruc_nombre_comercial IS DISTINCT FROM NEW.ruc_nombre_comercial THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_nombre_comercial', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_nombre_comercial', to_jsonb(OLD.ruc_nombre_comercial));
            v_new_values := v_new_values || jsonb_build_object('ruc_nombre_comercial', to_jsonb(NEW.ruc_nombre_comercial));
        END IF;
        IF OLD.ruc_fecha_inscripcion IS DISTINCT FROM NEW.ruc_fecha_inscripcion THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_fecha_inscripcion', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_fecha_inscripcion', to_jsonb(OLD.ruc_fecha_inscripcion));
            v_new_values := v_new_values || jsonb_build_object('ruc_fecha_inscripcion', to_jsonb(NEW.ruc_fecha_inscripcion));
        END IF;
        IF OLD.ruc_fecha_inicio_actividades IS DISTINCT FROM NEW.ruc_fecha_inicio_actividades THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_fecha_inicio_actividades', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_fecha_inicio_actividades', to_jsonb(OLD.ruc_fecha_inicio_actividades));
            v_new_values := v_new_values || jsonb_build_object('ruc_fecha_inicio_actividades', to_jsonb(NEW.ruc_fecha_inicio_actividades));
        END IF;
        IF OLD.ruc_estado_contribuyente IS DISTINCT FROM NEW.ruc_estado_contribuyente THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_estado_contribuyente', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_estado_contribuyente', to_jsonb(OLD.ruc_estado_contribuyente));
            v_new_values := v_new_values || jsonb_build_object('ruc_estado_contribuyente', to_jsonb(NEW.ruc_estado_contribuyente));
        END IF;
        IF OLD.ruc_condicion_contribuyente IS DISTINCT FROM NEW.ruc_condicion_contribuyente THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_condicion_contribuyente', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_condicion_contribuyente', to_jsonb(OLD.ruc_condicion_contribuyente));
            v_new_values := v_new_values || jsonb_build_object('ruc_condicion_contribuyente', to_jsonb(NEW.ruc_condicion_contribuyente));
        END IF;
        IF OLD.ruc_domicilio_fiscal IS DISTINCT FROM NEW.ruc_domicilio_fiscal THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_domicilio_fiscal', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_domicilio_fiscal', to_jsonb(OLD.ruc_domicilio_fiscal));
            v_new_values := v_new_values || jsonb_build_object('ruc_domicilio_fiscal', to_jsonb(NEW.ruc_domicilio_fiscal));
        END IF;
        IF OLD.ruc_actividad_comercio_exterior IS DISTINCT FROM NEW.ruc_actividad_comercio_exterior THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_actividad_comercio_exterior', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_actividad_comercio_exterior', to_jsonb(OLD.ruc_actividad_comercio_exterior));
            v_new_values := v_new_values || jsonb_build_object('ruc_actividad_comercio_exterior', to_jsonb(NEW.ruc_actividad_comercio_exterior));
        END IF;
        IF OLD.ruc_actividad_economica IS DISTINCT FROM NEW.ruc_actividad_economica THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ruc_actividad_economica', true);
            v_old_values := v_old_values || jsonb_build_object('ruc_actividad_economica', to_jsonb(OLD.ruc_actividad_economica));
            v_new_values := v_new_values || jsonb_build_object('ruc_actividad_economica', to_jsonb(NEW.ruc_actividad_economica));
        END IF;

        -- Facturación (5 campos)
        IF OLD.facturacion_sistema_emision_comprobante IS DISTINCT FROM NEW.facturacion_sistema_emision_comprobante THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('facturacion_sistema_emision_comprobante', true);
            v_old_values := v_old_values || jsonb_build_object('facturacion_sistema_emision_comprobante', to_jsonb(OLD.facturacion_sistema_emision_comprobante));
            v_new_values := v_new_values || jsonb_build_object('facturacion_sistema_emision_comprobante', to_jsonb(NEW.facturacion_sistema_emision_comprobante));
        END IF;
        IF OLD.facturacion_sistema_contabilidad IS DISTINCT FROM NEW.facturacion_sistema_contabilidad THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('facturacion_sistema_contabilidad', true);
            v_old_values := v_old_values || jsonb_build_object('facturacion_sistema_contabilidad', to_jsonb(OLD.facturacion_sistema_contabilidad));
            v_new_values := v_new_values || jsonb_build_object('facturacion_sistema_contabilidad', to_jsonb(NEW.facturacion_sistema_contabilidad));
        END IF;
        IF OLD.facturacion_comprobantes_autorizados IS DISTINCT FROM NEW.facturacion_comprobantes_autorizados THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('facturacion_comprobantes_autorizados', true);
            v_old_values := v_old_values || jsonb_build_object('facturacion_comprobantes_autorizados', to_jsonb(OLD.facturacion_comprobantes_autorizados));
            v_new_values := v_new_values || jsonb_build_object('facturacion_comprobantes_autorizados', to_jsonb(NEW.facturacion_comprobantes_autorizados));
        END IF;
        IF OLD.facturacion_sistema_emision_electronica IS DISTINCT FROM NEW.facturacion_sistema_emision_electronica THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('facturacion_sistema_emision_electronica', true);
            v_old_values := v_old_values || jsonb_build_object('facturacion_sistema_emision_electronica', to_jsonb(OLD.facturacion_sistema_emision_electronica));
            v_new_values := v_new_values || jsonb_build_object('facturacion_sistema_emision_electronica', to_jsonb(NEW.facturacion_sistema_emision_electronica));
        END IF;
        IF OLD.facturacion_afiliado_ple_desde IS DISTINCT FROM NEW.facturacion_afiliado_ple_desde THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('facturacion_afiliado_ple_desde', true);
            v_old_values := v_old_values || jsonb_build_object('facturacion_afiliado_ple_desde', to_jsonb(OLD.facturacion_afiliado_ple_desde));
            v_new_values := v_new_values || jsonb_build_object('facturacion_afiliado_ple_desde', to_jsonb(NEW.facturacion_afiliado_ple_desde));
        END IF;

        -- Renta (11 campos)
        IF OLD.renta_fecha_informacion IS DISTINCT FROM NEW.renta_fecha_informacion THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_fecha_informacion', true);
            v_old_values := v_old_values || jsonb_build_object('renta_fecha_informacion', to_jsonb(OLD.renta_fecha_informacion));
            v_new_values := v_new_values || jsonb_build_object('renta_fecha_informacion', to_jsonb(NEW.renta_fecha_informacion));
        END IF;
        IF OLD.renta_ingresos_netos IS DISTINCT FROM NEW.renta_ingresos_netos THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_ingresos_netos', true);
            v_old_values := v_old_values || jsonb_build_object('renta_ingresos_netos', to_jsonb(OLD.renta_ingresos_netos));
            v_new_values := v_new_values || jsonb_build_object('renta_ingresos_netos', to_jsonb(NEW.renta_ingresos_netos));
        END IF;
        IF OLD.renta_otros_ingresos IS DISTINCT FROM NEW.renta_otros_ingresos THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_otros_ingresos', true);
            v_old_values := v_old_values || jsonb_build_object('renta_otros_ingresos', to_jsonb(OLD.renta_otros_ingresos));
            v_new_values := v_new_values || jsonb_build_object('renta_otros_ingresos', to_jsonb(NEW.renta_otros_ingresos));
        END IF;
        IF OLD.renta_total_activos_netos IS DISTINCT FROM NEW.renta_total_activos_netos THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_total_activos_netos', true);
            v_old_values := v_old_values || jsonb_build_object('renta_total_activos_netos', to_jsonb(OLD.renta_total_activos_netos));
            v_new_values := v_new_values || jsonb_build_object('renta_total_activos_netos', to_jsonb(NEW.renta_total_activos_netos));
        END IF;
        IF OLD.renta_total_cuentas_por_pagar IS DISTINCT FROM NEW.renta_total_cuentas_por_pagar THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_total_cuentas_por_pagar', true);
            v_old_values := v_old_values || jsonb_build_object('renta_total_cuentas_por_pagar', to_jsonb(OLD.renta_total_cuentas_por_pagar));
            v_new_values := v_new_values || jsonb_build_object('renta_total_cuentas_por_pagar', to_jsonb(NEW.renta_total_cuentas_por_pagar));
        END IF;
        IF OLD.renta_total_patrimonio IS DISTINCT FROM NEW.renta_total_patrimonio THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_total_patrimonio', true);
            v_old_values := v_old_values || jsonb_build_object('renta_total_patrimonio', to_jsonb(OLD.renta_total_patrimonio));
            v_new_values := v_new_values || jsonb_build_object('renta_total_patrimonio', to_jsonb(NEW.renta_total_patrimonio));
        END IF;
        IF OLD.renta_capital_social IS DISTINCT FROM NEW.renta_capital_social THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_capital_social', true);
            v_old_values := v_old_values || jsonb_build_object('renta_capital_social', to_jsonb(OLD.renta_capital_social));
            v_new_values := v_new_values || jsonb_build_object('renta_capital_social', to_jsonb(NEW.renta_capital_social));
        END IF;
        IF OLD.renta_resultado_bruto IS DISTINCT FROM NEW.renta_resultado_bruto THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_resultado_bruto', true);
            v_old_values := v_old_values || jsonb_build_object('renta_resultado_bruto', to_jsonb(OLD.renta_resultado_bruto));
            v_new_values := v_new_values || jsonb_build_object('renta_resultado_bruto', to_jsonb(NEW.renta_resultado_bruto));
        END IF;
        IF OLD.renta_resultado_antes_participaciones IS DISTINCT FROM NEW.renta_resultado_antes_participaciones THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_resultado_antes_participaciones', true);
            v_old_values := v_old_values || jsonb_build_object('renta_resultado_antes_participaciones', to_jsonb(OLD.renta_resultado_antes_participaciones));
            v_new_values := v_new_values || jsonb_build_object('renta_resultado_antes_participaciones', to_jsonb(NEW.renta_resultado_antes_participaciones));
        END IF;
        IF OLD.renta_importe_pagado IS DISTINCT FROM NEW.renta_importe_pagado THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_importe_pagado', true);
            v_old_values := v_old_values || jsonb_build_object('renta_importe_pagado', to_jsonb(OLD.renta_importe_pagado));
            v_new_values := v_new_values || jsonb_build_object('renta_importe_pagado', to_jsonb(NEW.renta_importe_pagado));
        END IF;
        IF OLD.renta_cuentas_por_cobrar_comerciales_terceros IS DISTINCT FROM NEW.renta_cuentas_por_cobrar_comerciales_terceros THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('renta_cuentas_por_cobrar_comerciales_terceros', true);
            v_old_values := v_old_values || jsonb_build_object('renta_cuentas_por_cobrar_comerciales_terceros', to_jsonb(OLD.renta_cuentas_por_cobrar_comerciales_terceros));
            v_new_values := v_new_values || jsonb_build_object('renta_cuentas_por_cobrar_comerciales_terceros', to_jsonb(NEW.renta_cuentas_por_cobrar_comerciales_terceros));
        END IF;

        -- ITAN (5 campos)
        IF OLD.itan_presento_declaracion IS DISTINCT FROM NEW.itan_presento_declaracion THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('itan_presento_declaracion', true);
            v_old_values := v_old_values || jsonb_build_object('itan_presento_declaracion', to_jsonb(OLD.itan_presento_declaracion));
            v_new_values := v_new_values || jsonb_build_object('itan_presento_declaracion', to_jsonb(NEW.itan_presento_declaracion));
        END IF;
        IF OLD.itan_base_imponible IS DISTINCT FROM NEW.itan_base_imponible THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('itan_base_imponible', true);
            v_old_values := v_old_values || jsonb_build_object('itan_base_imponible', to_jsonb(OLD.itan_base_imponible));
            v_new_values := v_new_values || jsonb_build_object('itan_base_imponible', to_jsonb(NEW.itan_base_imponible));
        END IF;
        IF OLD.itan_itan_a_pagar IS DISTINCT FROM NEW.itan_itan_a_pagar THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('itan_itan_a_pagar', true);
            v_old_values := v_old_values || jsonb_build_object('itan_itan_a_pagar', to_jsonb(OLD.itan_itan_a_pagar));
            v_new_values := v_new_values || jsonb_build_object('itan_itan_a_pagar', to_jsonb(NEW.itan_itan_a_pagar));
        END IF;
        IF OLD.itan_cuotas_cantidad IS DISTINCT FROM NEW.itan_cuotas_cantidad THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('itan_cuotas_cantidad', true);
            v_old_values := v_old_values || jsonb_build_object('itan_cuotas_cantidad', to_jsonb(OLD.itan_cuotas_cantidad));
            v_new_values := v_new_values || jsonb_build_object('itan_cuotas_cantidad', to_jsonb(NEW.itan_cuotas_cantidad));
        END IF;
        IF OLD.itan_cuotas_monto IS DISTINCT FROM NEW.itan_cuotas_monto THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('itan_cuotas_monto', true);
            v_old_values := v_old_values || jsonb_build_object('itan_cuotas_monto', to_jsonb(OLD.itan_cuotas_monto));
            v_new_values := v_new_values || jsonb_build_object('itan_cuotas_monto', to_jsonb(NEW.itan_cuotas_monto));
        END IF;

        -- Ingresos Mensuales (12 campos)
        IF OLD.ingresos_enero IS DISTINCT FROM NEW.ingresos_enero THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_enero', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_enero', to_jsonb(OLD.ingresos_enero));
            v_new_values := v_new_values || jsonb_build_object('ingresos_enero', to_jsonb(NEW.ingresos_enero));
        END IF;
        IF OLD.ingresos_febrero IS DISTINCT FROM NEW.ingresos_febrero THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_febrero', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_febrero', to_jsonb(OLD.ingresos_febrero));
            v_new_values := v_new_values || jsonb_build_object('ingresos_febrero', to_jsonb(NEW.ingresos_febrero));
        END IF;
        IF OLD.ingresos_marzo IS DISTINCT FROM NEW.ingresos_marzo THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_marzo', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_marzo', to_jsonb(OLD.ingresos_marzo));
            v_new_values := v_new_values || jsonb_build_object('ingresos_marzo', to_jsonb(NEW.ingresos_marzo));
        END IF;
        IF OLD.ingresos_abril IS DISTINCT FROM NEW.ingresos_abril THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_abril', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_abril', to_jsonb(OLD.ingresos_abril));
            v_new_values := v_new_values || jsonb_build_object('ingresos_abril', to_jsonb(NEW.ingresos_abril));
        END IF;
        IF OLD.ingresos_mayo IS DISTINCT FROM NEW.ingresos_mayo THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_mayo', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_mayo', to_jsonb(OLD.ingresos_mayo));
            v_new_values := v_new_values || jsonb_build_object('ingresos_mayo', to_jsonb(NEW.ingresos_mayo));
        END IF;
        IF OLD.ingresos_junio IS DISTINCT FROM NEW.ingresos_junio THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_junio', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_junio', to_jsonb(OLD.ingresos_junio));
            v_new_values := v_new_values || jsonb_build_object('ingresos_junio', to_jsonb(NEW.ingresos_junio));
        END IF;
        IF OLD.ingresos_julio IS DISTINCT FROM NEW.ingresos_julio THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_julio', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_julio', to_jsonb(OLD.ingresos_julio));
            v_new_values := v_new_values || jsonb_build_object('ingresos_julio', to_jsonb(NEW.ingresos_julio));
        END IF;
        IF OLD.ingresos_agosto IS DISTINCT FROM NEW.ingresos_agosto THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_agosto', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_agosto', to_jsonb(OLD.ingresos_agosto));
            v_new_values := v_new_values || jsonb_build_object('ingresos_agosto', to_jsonb(NEW.ingresos_agosto));
        END IF;
        IF OLD.ingresos_setiembre IS DISTINCT FROM NEW.ingresos_setiembre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_setiembre', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_setiembre', to_jsonb(OLD.ingresos_setiembre));
            v_new_values := v_new_values || jsonb_build_object('ingresos_setiembre', to_jsonb(NEW.ingresos_setiembre));
        END IF;
        IF OLD.ingresos_octubre IS DISTINCT FROM NEW.ingresos_octubre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_octubre', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_octubre', to_jsonb(OLD.ingresos_octubre));
            v_new_values := v_new_values || jsonb_build_object('ingresos_octubre', to_jsonb(NEW.ingresos_octubre));
        END IF;
        IF OLD.ingresos_noviembre IS DISTINCT FROM NEW.ingresos_noviembre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_noviembre', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_noviembre', to_jsonb(OLD.ingresos_noviembre));
            v_new_values := v_new_values || jsonb_build_object('ingresos_noviembre', to_jsonb(NEW.ingresos_noviembre));
        END IF;
        IF OLD.ingresos_diciembre IS DISTINCT FROM NEW.ingresos_diciembre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ingresos_diciembre', true);
            v_old_values := v_old_values || jsonb_build_object('ingresos_diciembre', to_jsonb(OLD.ingresos_diciembre));
            v_new_values := v_new_values || jsonb_build_object('ingresos_diciembre', to_jsonb(NEW.ingresos_diciembre));
        END IF;

        -- Ventas Mensuales (12 campos)
        IF OLD.ventas_enero IS DISTINCT FROM NEW.ventas_enero THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_enero', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_enero', to_jsonb(OLD.ventas_enero));
            v_new_values := v_new_values || jsonb_build_object('ventas_enero', to_jsonb(NEW.ventas_enero));
        END IF;
        IF OLD.ventas_febrero IS DISTINCT FROM NEW.ventas_febrero THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_febrero', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_febrero', to_jsonb(OLD.ventas_febrero));
            v_new_values := v_new_values || jsonb_build_object('ventas_febrero', to_jsonb(NEW.ventas_febrero));
        END IF;
        IF OLD.ventas_marzo IS DISTINCT FROM NEW.ventas_marzo THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_marzo', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_marzo', to_jsonb(OLD.ventas_marzo));
            v_new_values := v_new_values || jsonb_build_object('ventas_marzo', to_jsonb(NEW.ventas_marzo));
        END IF;
        IF OLD.ventas_abril IS DISTINCT FROM NEW.ventas_abril THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_abril', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_abril', to_jsonb(OLD.ventas_abril));
            v_new_values := v_new_values || jsonb_build_object('ventas_abril', to_jsonb(NEW.ventas_abril));
        END IF;
        IF OLD.ventas_mayo IS DISTINCT FROM NEW.ventas_mayo THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_mayo', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_mayo', to_jsonb(OLD.ventas_mayo));
            v_new_values := v_new_values || jsonb_build_object('ventas_mayo', to_jsonb(NEW.ventas_mayo));
        END IF;
        IF OLD.ventas_junio IS DISTINCT FROM NEW.ventas_junio THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_junio', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_junio', to_jsonb(OLD.ventas_junio));
            v_new_values := v_new_values || jsonb_build_object('ventas_junio', to_jsonb(NEW.ventas_junio));
        END IF;
        IF OLD.ventas_julio IS DISTINCT FROM NEW.ventas_julio THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_julio', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_julio', to_jsonb(OLD.ventas_julio));
            v_new_values := v_new_values || jsonb_build_object('ventas_julio', to_jsonb(NEW.ventas_julio));
        END IF;
        IF OLD.ventas_agosto IS DISTINCT FROM NEW.ventas_agosto THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_agosto', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_agosto', to_jsonb(OLD.ventas_agosto));
            v_new_values := v_new_values || jsonb_build_object('ventas_agosto', to_jsonb(NEW.ventas_agosto));
        END IF;
        IF OLD.ventas_setiembre IS DISTINCT FROM NEW.ventas_setiembre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_setiembre', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_setiembre', to_jsonb(OLD.ventas_setiembre));
            v_new_values := v_new_values || jsonb_build_object('ventas_setiembre', to_jsonb(NEW.ventas_setiembre));
        END IF;
        IF OLD.ventas_octubre IS DISTINCT FROM NEW.ventas_octubre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_octubre', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_octubre', to_jsonb(OLD.ventas_octubre));
            v_new_values := v_new_values || jsonb_build_object('ventas_octubre', to_jsonb(NEW.ventas_octubre));
        END IF;
        IF OLD.ventas_noviembre IS DISTINCT FROM NEW.ventas_noviembre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_noviembre', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_noviembre', to_jsonb(OLD.ventas_noviembre));
            v_new_values := v_new_values || jsonb_build_object('ventas_noviembre', to_jsonb(NEW.ventas_noviembre));
        END IF;
        IF OLD.ventas_diciembre IS DISTINCT FROM NEW.ventas_diciembre THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_diciembre', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_diciembre', to_jsonb(OLD.ventas_diciembre));
            v_new_values := v_new_values || jsonb_build_object('ventas_diciembre', to_jsonb(NEW.ventas_diciembre));
        END IF;

        -- Ventas Totales (2 campos)
        IF OLD.ventas_total_ingresos IS DISTINCT FROM NEW.ventas_total_ingresos THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_total_ingresos', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_total_ingresos', to_jsonb(OLD.ventas_total_ingresos));
            v_new_values := v_new_values || jsonb_build_object('ventas_total_ingresos', to_jsonb(NEW.ventas_total_ingresos));
        END IF;
        IF OLD.ventas_total_essalud IS DISTINCT FROM NEW.ventas_total_essalud THEN
            v_changed_fields := v_changed_fields || jsonb_build_object('ventas_total_essalud', true);
            v_old_values := v_old_values || jsonb_build_object('ventas_total_essalud', to_jsonb(OLD.ventas_total_essalud));
            v_new_values := v_new_values || jsonb_build_object('ventas_total_essalud', to_jsonb(NEW.ventas_total_essalud));
        END IF;

        -- Solo insertar log si hubo cambios
        IF v_changed_fields <> '{}'::JSONB THEN
            v_old_values := v_old_values || jsonb_build_object('anio_reporte', to_jsonb(OLD.anio_reporte));
            v_new_values := v_new_values || jsonb_build_object('anio_reporte', to_jsonb(NEW.anio_reporte));
            
            INSERT INTO public.reporte_tributario_audit_log (
                reporte_tributario_id, user_id, user_email, action,
                changed_fields, old_values, new_values
            ) VALUES (
                NEW.id, v_user_id, v_user_email, v_action,
                v_changed_fields, v_old_values, v_new_values
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        RETURN NULL; -- No auditar DELETEs
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 7: Crear triggers
CREATE TRIGGER reporte_tributario_audit_insert
    AFTER INSERT ON public.reporte_tributario
    FOR EACH ROW EXECUTE FUNCTION public.reporte_tributario_audit_trigger();

CREATE TRIGGER reporte_tributario_audit_update
    AFTER UPDATE ON public.reporte_tributario
    FOR EACH ROW EXECUTE FUNCTION public.reporte_tributario_audit_trigger();

CREATE TRIGGER reporte_tributario_audit_delete
    AFTER DELETE ON public.reporte_tributario
    FOR EACH ROW EXECUTE FUNCTION public.reporte_tributario_audit_trigger();

-- ==================================================================
-- COMPLETADO - Ahora trackea TODOS los 61 campos
-- ==================================================================

