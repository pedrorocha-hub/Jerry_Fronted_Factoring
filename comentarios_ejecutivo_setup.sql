-- Crear tabla para comentarios del ejecutivo
CREATE TABLE IF NOT EXISTS comentarios_ejecutivo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rib_id UUID REFERENCES rib(id) ON DELETE CASCADE,
    solicitud_id UUID REFERENCES solicitudes_operacion(id) ON DELETE CASCADE,
    comentario TEXT NOT NULL,
    archivos_adjuntos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Asegurar que solicitud_id esté presente (rib_id es opcional)
    CONSTRAINT check_rib_or_solicitud CHECK (
        solicitud_id IS NOT NULL
    )
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_rib_id ON comentarios_ejecutivo(rib_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_solicitud_id ON comentarios_ejecutivo(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_ejecutivo_created_at ON comentarios_ejecutivo(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_comentarios_ejecutivo_updated_at ON comentarios_ejecutivo;
CREATE TRIGGER update_comentarios_ejecutivo_updated_at
    BEFORE UPDATE ON comentarios_ejecutivo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE comentarios_ejecutivo ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
-- Los usuarios autenticados pueden ver todos los comentarios
CREATE POLICY "Usuarios autenticados pueden ver comentarios" ON comentarios_ejecutivo
    FOR SELECT USING (auth.role() = 'authenticated');

-- Los usuarios autenticados pueden insertar comentarios
CREATE POLICY "Usuarios autenticados pueden insertar comentarios" ON comentarios_ejecutivo
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Los usuarios autenticados pueden actualizar comentarios
CREATE POLICY "Usuarios autenticados pueden actualizar comentarios" ON comentarios_ejecutivo
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Los usuarios autenticados pueden eliminar comentarios
CREATE POLICY "Usuarios autenticados pueden eliminar comentarios" ON comentarios_ejecutivo
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentarios sobre la tabla
COMMENT ON TABLE comentarios_ejecutivo IS 'Tabla para almacenar comentarios del ejecutivo asociados a análisis RIB o solicitudes de operación';
COMMENT ON COLUMN comentarios_ejecutivo.rib_id IS 'ID del análisis RIB al que pertenece el comentario (opcional)';
COMMENT ON COLUMN comentarios_ejecutivo.solicitud_id IS 'ID de la solicitud de operación al que pertenece el comentario (opcional)';
COMMENT ON COLUMN comentarios_ejecutivo.comentario IS 'Texto del comentario del ejecutivo';
COMMENT ON COLUMN comentarios_ejecutivo.archivos_adjuntos IS 'Array de rutas de archivos adjuntos en storage';
