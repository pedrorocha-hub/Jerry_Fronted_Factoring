-- Función helper para crear usuarios con onboarding pendiente
-- Usar esta función desde Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_user_with_pending_onboarding(
  user_email TEXT,
  user_role TEXT DEFAULT 'COMERCIAL',
  user_full_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Crear el usuario en auth.users
  -- NOTA: Esta parte debe hacerse desde el Dashboard de Supabase
  -- porque requiere permisos especiales de auth
  
  -- Una vez creado el usuario, obtener su ID
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado en auth.users. Créalo primero desde el Dashboard.'
    );
  END IF;
  
  -- Crear/actualizar el perfil con onboarding pendiente
  INSERT INTO profiles (id, full_name, role, onboarding_completed, created_at, updated_at)
  VALUES (
    new_user_id,
    COALESCE(user_full_name, user_email),
    user_role::TEXT,
    FALSE,  -- Onboarding pendiente
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    onboarding_completed = FALSE,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email,
    'role', user_role,
    'onboarding_completed', FALSE,
    'message', 'Usuario creado con onboarding pendiente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo de uso:
-- SELECT create_user_with_pending_onboarding(
--   'nuevo@usuario.com',
--   'COMERCIAL',
--   'Nombre del Usuario'
-- );
