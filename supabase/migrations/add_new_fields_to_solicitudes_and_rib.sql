-- Agregar campos a la tabla solicitudes_operacion
ALTER TABLE public.solicitudes_operacion
ADD COLUMN IF NOT EXISTS visita_contacto_telefono TEXT,
ADD COLUMN IF NOT EXISTS tipo_relacion TEXT, -- 'PROVEEDOR', 'CLIENTE', 'CONTRATISTA'
ADD COLUMN IF NOT EXISTS detalle_proyecto TEXT,
ADD COLUMN IF NOT EXISTS nivel_endeudamiento TEXT, -- 'NORMAL', 'CPP', 'DEFICIENTE', 'PERDIDA'
ADD COLUMN IF NOT EXISTS tiene_disputas BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS detalle_disputas TEXT,
ADD COLUMN IF NOT EXISTS tipo_aval_especifico TEXT, -- 'AVAL_PERSONAL', 'FIANZA_SOLIDARIA', etc.
ADD COLUMN IF NOT EXISTS analisis_fortalezas TEXT,
ADD COLUMN IF NOT EXISTS analisis_riesgos TEXT,
ADD COLUMN IF NOT EXISTS analisis_mitigantes TEXT;

-- Agregar campos a la tabla rib
ALTER TABLE public.rib
ADD COLUMN IF NOT EXISTS principales_productos_servicios TEXT,
ADD COLUMN IF NOT EXISTS principales_clientes_proveedores TEXT,
ADD COLUMN IF NOT EXISTS proyectos_relevantes TEXT,
ADD COLUMN IF NOT EXISTS noticias_mercado TEXT;

-- Comentario para documentar los cambios
COMMENT ON COLUMN public.solicitudes_operacion.visita_contacto_telefono IS 'Teléfono del contacto entrevistado en la visita';
COMMENT ON COLUMN public.solicitudes_operacion.analisis_fortalezas IS 'Campo para el informe final de riesgos - Fortalezas';
COMMENT ON COLUMN public.rib.principales_productos_servicios IS 'Desglose de la descripción de la empresa';