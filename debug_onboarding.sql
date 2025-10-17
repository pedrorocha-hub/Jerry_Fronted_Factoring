-- Script para debuggear el problema de onboarding
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todos los usuarios con su estado de onboarding
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.full_name,
  p.onboarding_completed,
  p.role,
  p.updated_at as profile_updated,
  CASE 
    WHEN p.id IS NULL THEN '❌ Sin perfil'
    WHEN p.onboarding_completed = TRUE THEN '✅ Onboarding completo'
    WHEN p.onboarding_completed = FALSE THEN '⏳ Onboarding pendiente'
    ELSE '⚠️ Estado NULL'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Ver el estado de onboarding_completed específicamente
SELECT 
  u.email,
  p.onboarding_completed,
  pg_typeof(p.onboarding_completed) as data_type,
  CASE 
    WHEN p.onboarding_completed IS NULL THEN 'NULL'
    WHEN p.onboarding_completed = TRUE THEN 'TRUE'
    WHEN p.onboarding_completed = FALSE THEN 'FALSE'
    ELSE 'UNKNOWN'
  END as value_check
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 3. Verificar el valor por defecto de la columna
SELECT 
  column_name,
  column_default,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'onboarding_completed';

-- 4. Arreglar usuarios con onboarding NULL (si existen)
UPDATE profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;

-- 5. Ver resultados finales
SELECT 
  u.email,
  p.onboarding_completed,
  p.full_name
FROM auth.users u
JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
