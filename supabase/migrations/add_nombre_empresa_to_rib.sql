-- Agregar campo nombre_empresa a la tabla rib
-- Este campo se usará para RIBs creados manualmente sin ficha RUC

ALTER TABLE rib 
ADD COLUMN IF NOT EXISTS nombre_empresa TEXT;

-- Comentario explicativo
COMMENT ON COLUMN rib.nombre_empresa IS 'Nombre de la empresa. Se usa cuando el RIB se crea manualmente sin ficha RUC asociada.';

