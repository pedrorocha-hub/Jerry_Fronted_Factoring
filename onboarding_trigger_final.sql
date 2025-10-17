-- Script final para el trigger de onboarding con full_name
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar trigger y función existentes si existen
DROP TRIGGER IF EXISTS on_create_user_create_profile ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile_with_onboarding();

-- 2. Crear la función mejorada (sin full_name por defecto)
CREATE OR REPLACE FUNCTION create_user_profile_with_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar perfil con onboarding pendiente (sin full_name)
  INSERT INTO profiles (id, full_name, role, onboarding_completed, updated_at)
  VALUES (
    NEW.id,
    NULL, -- full_name se completará en el onboarding
    'COMERCIAL', -- Rol por defecto
    FALSE, -- Onboarding pendiente
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Evitar errores si ya existe
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el trigger
CREATE TRIGGER on_create_user_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_with_onboarding();

-- 4. Verificar que se creó correctamente
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_create_user_create_profile';

-- 5. Verificar usuarios existentes (opcional)
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.full_name,
  p.onboarding_completed,
  p.role,
  p.updated_at as profile_updated
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
