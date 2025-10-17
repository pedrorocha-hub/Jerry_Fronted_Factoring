-- ==================================================================
-- CONFIGURACIÓN DEL BUCKET "documentos" PARA COMENTARIOS EJECUTIVO
-- ==================================================================
-- Este script configura el bucket de storage y sus políticas de seguridad
-- ==================================================================

-- Paso 1: Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- Paso 2: Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar archivos" ON storage.objects;

-- Paso 3: Crear políticas de acceso

-- Política para INSERT (subir archivos)
CREATE POLICY "Usuarios autenticados pueden subir archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Política para SELECT (ver/descargar archivos)
CREATE POLICY "Usuarios autenticados pueden ver archivos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');

-- Política para UPDATE (actualizar archivos)
CREATE POLICY "Usuarios autenticados pueden actualizar archivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos')
WITH CHECK (bucket_id = 'documentos');

-- Política para DELETE (eliminar archivos)
CREATE POLICY "Usuarios autenticados pueden eliminar archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');

-- Paso 4: Configurar tipos MIME permitidos
-- Nota: Esto debe hacerse manualmente en el dashboard de Supabase
-- o mediante la API de administración. Los tipos MIME a permitir son:
--
-- - application/pdf
-- - image/jpeg
-- - image/jpg  
-- - image/png
-- - image/gif
-- - image/webp
-- - application/msword
-- - application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- - text/plain
--
-- Alternativamente, puedes permitir todos los tipos MIME si lo prefieres.

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- Para verificar que el bucket se creó correctamente:
-- SELECT * FROM storage.buckets WHERE id = 'documentos';
--
-- Para verificar las políticas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- ==================================================================

