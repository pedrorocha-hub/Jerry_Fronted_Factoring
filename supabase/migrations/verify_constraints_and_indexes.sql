
-- Verificar constraints y índices en rib_reporte_tributario
-- Esto puede revelar comparaciones UUID vs TEXT

-- 1. Ver todas las constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'rib_reporte_tributario'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 2. Ver índices únicos
SELECT
    i.relname as index_name,
    a.attname as column_name,
    am.amname as index_type
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_am am ON i.relam = am.oid
JOIN pg_attribute a ON a.attrelid = t.oid
WHERE t.relname = 'rib_reporte_tributario'
    AND a.attnum = ANY(ix.indkey)
ORDER BY i.relname;

-- 3. Ver foreign keys y sus tipos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'rib_reporte_tributario';

