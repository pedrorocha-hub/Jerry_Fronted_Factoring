-- Verificar si los triggers existen
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'ventas_mensuales'
ORDER BY trigger_name;

-- Si no aparecen triggers, significa que no se crearon
-- Si aparecen pero no funcionan, hay un error en la función
