-- Migration: Add nombre_empresa column to rib_reporte_tributario table
-- This allows storing company names for manually created reports without RUC in ficha_ruc

-- Add nombre_empresa column
ALTER TABLE rib_reporte_tributario 
ADD COLUMN IF NOT EXISTS nombre_empresa TEXT;

-- Add comment
COMMENT ON COLUMN rib_reporte_tributario.nombre_empresa IS 'Nombre de la empresa (usado cuando no existe en ficha_ruc)';

