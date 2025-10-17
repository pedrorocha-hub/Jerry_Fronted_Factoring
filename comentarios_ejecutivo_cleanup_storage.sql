-- ==================================================================
-- TRIGGER PARA ELIMINAR ARCHIVOS DEL STORAGE AL BORRAR COMENTARIOS
-- ==================================================================
-- Este script crea un trigger que elimina automáticamente los archivos
-- adjuntos del bucket de storage cuando se elimina un comentario del ejecutivo
-- ==================================================================

-- Paso 1: Crear la función que elimina los archivos del storage
CREATE OR REPLACE FUNCTION public.cleanup_comentarios_ejecutivo_files()
RETURNS TRIGGER AS $$
DECLARE
    file_path TEXT;
    deleted_count INTEGER := 0;
BEGIN
    -- Si hay archivos adjuntos, eliminarlos del storage
    IF OLD.archivos_adjuntos IS NOT NULL AND array_length(OLD.archivos_adjuntos, 1) > 0 THEN
        -- Iterar sobre cada archivo y eliminarlo
        FOREACH file_path IN ARRAY OLD.archivos_adjuntos
        LOOP
            -- Eliminar el archivo del bucket 'documentos'
            DELETE FROM storage.objects
            WHERE bucket_id = 'documentos'
            AND name = file_path;
            
            -- Contar archivos eliminados
            IF FOUND THEN
                deleted_count := deleted_count + 1;
            END IF;
        END LOOP;
        
        -- Log para debugging (opcional)
        RAISE NOTICE 'Eliminados % archivo(s) del storage para comentario ID: %', 
            deleted_count, OLD.id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 2: Crear el trigger que se ejecuta ANTES del DELETE
-- Importante: debe ser BEFORE DELETE para que OLD todavía esté disponible
DROP TRIGGER IF EXISTS cleanup_comentarios_ejecutivo_files_trigger ON public.comentarios_ejecutivo;

CREATE TRIGGER cleanup_comentarios_ejecutivo_files_trigger
    BEFORE DELETE ON public.comentarios_ejecutivo
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_comentarios_ejecutivo_files();

-- Paso 3: (Opcional) Función para limpiar archivos huérfanos manualmente
-- Esta función busca y elimina archivos en el storage que ya no tienen un comentario asociado

-- Eliminar la función si existe (necesario porque cambiamos el tipo de retorno)
DROP FUNCTION IF EXISTS public.cleanup_orphaned_comentarios_files();

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_comentarios_files()
RETURNS TABLE(deleted_file TEXT, deleted BOOLEAN) AS $$
DECLARE
    file_record RECORD;
    all_files TEXT[];
    referenced_files TEXT[];
    was_deleted BOOLEAN;
BEGIN
    -- Obtener todos los archivos referenciados en comentarios_ejecutivo
    SELECT array_agg(DISTINCT unnest(archivos_adjuntos))
    INTO referenced_files
    FROM public.comentarios_ejecutivo
    WHERE archivos_adjuntos IS NOT NULL;
    
    -- Obtener todos los archivos en el bucket con prefijo 'comentarios_ejecutivo/'
    FOR file_record IN 
        SELECT name 
        FROM storage.objects 
        WHERE bucket_id = 'documentos' 
        AND name LIKE 'comentarios_ejecutivo/%'
    LOOP
        -- Si el archivo no está en la lista de referenciados, eliminarlo
        IF referenced_files IS NULL OR NOT (file_record.name = ANY(referenced_files)) THEN
            DELETE FROM storage.objects
            WHERE bucket_id = 'documentos'
            AND name = file_record.name;
            
            was_deleted := FOUND;
            deleted_file := file_record.name;
            deleted := was_deleted;
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================================
-- FIN DEL SCRIPT
-- ==================================================================
-- 
-- CÓMO USAR:
-- 
-- 1. Ejecuta este script en Supabase SQL Editor
-- 
-- 2. Los archivos se eliminarán automáticamente cuando borres un comentario:
--    DELETE FROM comentarios_ejecutivo WHERE id = 'algún-uuid';
-- 
-- 3. Para limpiar manualmente archivos huérfanos (opcional):
--    SELECT * FROM cleanup_orphaned_comentarios_files();
-- 
-- ==================================================================

