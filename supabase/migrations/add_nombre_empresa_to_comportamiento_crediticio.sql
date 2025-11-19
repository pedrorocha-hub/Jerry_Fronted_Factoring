-- Agregar campo nombre_empresa a la tabla comportamiento_crediticio
-- Este campo se usará para registros creados manualmente sin ficha RUC

ALTER TABLE comportamiento_crediticio 
ADD COLUMN IF NOT EXISTS nombre_empresa TEXT;

-- Comentario explicativo
COMMENT ON COLUMN comportamiento_crediticio.nombre_empresa IS 'Nombre de la empresa. Se usa cuando el registro se crea manualmente sin ficha RUC asociada.';

