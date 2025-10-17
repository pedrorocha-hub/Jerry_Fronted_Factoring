-- Script para configurar el sistema de onboarding
-- Ejecutar este script en Supabase SQL Editor

-- 1. Agregar la columna onboarding_completed a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Actualizar usuarios existentes para marcar que ya completaron el onboarding
-- (Esto es para usuarios que ya están en el sistema)
UPDATE profiles 
SET onboarding_completed = TRUE 
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;

-- 3. Crear una política RLS para permitir que los usuarios actualicen su propio onboarding
CREATE POLICY "Users can update their own onboarding status" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- 4. Función para crear un perfil de usuario con onboarding pendiente
-- (Útil para cuando se crean nuevos usuarios desde el admin)
CREATE OR REPLACE FUNCTION create_user_profile_with_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, onboarding_completed, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'COMERCIAL', -- Rol por defecto
    FALSE, -- Onboarding pendiente para nuevos usuarios
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para crear automáticamente el perfil cuando se crea un usuario
-- (Solo si no existe ya un trigger similar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_create_user_create_profile'
  ) THEN
    CREATE TRIGGER on_create_user_create_profile
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_user_profile_with_onboarding();
  END IF;
END
$$;

-- 6. Función RPC para verificar si el usuario actual completó el onboarding
CREATE OR REPLACE FUNCTION is_onboarding_completed()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT onboarding_completed 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función RPC para obtener usuarios con perfiles (para la página de admin)
-- Primero eliminamos la función existente si tiene una estructura diferente
DROP FUNCTION IF EXISTS get_users_with_profiles();

-- Luego creamos la función nueva
CREATE OR REPLACE FUNCTION get_users_with_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  full_name TEXT,
  onboarding_completed BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    p.role::TEXT,
    p.full_name::TEXT,
    p.onboarding_completed,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Comentarios para documentación
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indica si el usuario ha completado el proceso de onboarding inicial (establecer contraseña)';
COMMENT ON FUNCTION is_onboarding_completed() IS 'Retorna true si el usuario actual ha completado el onboarding';
COMMENT ON FUNCTION create_user_profile_with_onboarding() IS 'Función trigger para crear perfiles de usuario con onboarding pendiente';
