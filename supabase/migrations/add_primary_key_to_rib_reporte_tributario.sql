-- Migration: Add primary key constraint to rib_reporte_tributario
-- La clave primaria compuesta asegura que cada combinación de id, anio y tipo_entidad sea única

-- Primero, verificar si ya existe una constraint de primary key
DO $$ 
BEGIN
    -- Intentar eliminar constraint de primary key si existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rib_reporte_tributario_pkey' 
        AND conrelid = 'rib_reporte_tributario'::regclass
    ) THEN
        ALTER TABLE rib_reporte_tributario DROP CONSTRAINT rib_reporte_tributario_pkey;
    END IF;
END $$;

-- Agregar la clave primaria compuesta
-- Esto permite que el mismo 'id' tenga múltiples registros, pero cada combinación
-- de (id, anio, tipo_entidad) debe ser única
ALTER TABLE rib_reporte_tributario
ADD CONSTRAINT rib_reporte_tributario_pkey 
PRIMARY KEY (id, anio, tipo_entidad);

-- Comentario explicativo
COMMENT ON CONSTRAINT rib_reporte_tributario_pkey ON rib_reporte_tributario IS 
  'Primary key compuesta: un reporte puede tener múltiples años y tipos de entidad (deudor/proveedor)';

