# Sistema de Onboarding - Instrucciones de Implementación

## 📋 Descripción

Este sistema implementa un flujo de onboarding para nuevos usuarios que necesitan establecer su contraseña inicial antes de acceder a la aplicación.

## 🔄 Flujo de Funcionamiento

1. **Usuario nuevo** → Se crea con `onboarding_completed: false`
2. **Login exitoso** → Si `onboarding_completed: false`, redirige a `/onboarding`
3. **Página de onboarding** → Usuario establece contraseña segura
4. **Contraseña actualizada** → Se marca `onboarding_completed: true`
5. **Redirección** → Usuario accede al dashboard principal

## 🛠️ Pasos de Implementación

### 1. Base de Datos (Supabase)

Ejecutar el script SQL en el editor de Supabase:

```bash
# Ejecutar en Supabase SQL Editor:
onboarding_setup.sql
```

Este script:
- ✅ Agrega columna `onboarding_completed` a la tabla `profiles`
- ✅ Marca usuarios existentes como onboarding completado
- ✅ Crea políticas RLS necesarias
- ✅ Configura triggers para nuevos usuarios
- ✅ Crea funciones RPC auxiliares

### 2. Código Frontend (Ya implementado)

Los siguientes archivos han sido modificados/creados:

#### ✅ Archivos Modificados:
- `src/contexts/SessionContext.tsx` - Manejo del estado de onboarding
- `src/components/auth/ProtectedRoute.tsx` - Redirección a onboarding
- `src/App.tsx` - Ruta de onboarding agregada

#### ✅ Archivos Creados:
- `src/pages/Onboarding.tsx` - Página de configuración inicial

### 3. Configuración de Usuarios Nuevos

#### Opción A: Crear usuario desde Supabase Auth Dashboard
1. Ir a Authentication → Users en Supabase
2. Crear nuevo usuario
3. El trigger automáticamente creará el perfil con `onboarding_completed: false`

#### Opción B: Crear usuario programáticamente
```typescript
// Ejemplo de función para crear usuario desde admin
const createNewUser = async (email: string, role: 'ADMINISTRADOR' | 'COMERCIAL') => {
  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'temp_password_123', // Contraseña temporal
    email_confirm: true
  });

  if (error) throw error;

  // El trigger automáticamente creará el perfil con onboarding_completed: false
  return data.user;
};
```

## 🎯 Características del Sistema

### Página de Onboarding (`/onboarding`)
- ✅ Validación de contraseña robusta (8+ caracteres, mayúsculas, minúsculas, números, símbolos)
- ✅ Confirmación de contraseña
- ✅ Interfaz consistente con el diseño de la app
- ✅ Mensajes de error claros
- ✅ Feedback visual de éxito
- ✅ Redirección automática al dashboard

### Protección de Rutas
- ✅ Usuarios sin sesión → `/login`
- ✅ Usuarios sin onboarding → `/onboarding`
- ✅ Usuarios sin permisos admin → `/` (para rutas admin)

### Gestión de Estado
- ✅ Context global para estado de onboarding
- ✅ Actualización automática al completar onboarding
- ✅ Persistencia en base de datos

## 🔒 Seguridad

### Validación de Contraseñas
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial

### Políticas RLS
- Los usuarios solo pueden actualizar su propio estado de onboarding
- Verificación de autenticación en todas las operaciones

## 🧪 Casos de Uso

### Usuario Nuevo
1. Admin crea usuario → `onboarding_completed: false`
2. Usuario recibe credenciales por email
3. Usuario hace login → Redirige a `/onboarding`
4. Usuario establece contraseña → `onboarding_completed: true`
5. Usuario accede a la aplicación

### Usuario Existente
1. Usuario hace login → Acceso directo al dashboard
2. No ve la página de onboarding (ya completada)

### Administrador
1. Puede ver estado de onboarding de usuarios en `/admin/users`
2. Puede crear nuevos usuarios que requerirán onboarding

## 📱 Experiencia de Usuario

### Flujo Visual
```
Login → [Onboarding] → Dashboard
  ↓         ↓           ↓
Email   Establecer   Aplicación
Pass    Contraseña   Principal
```

### Estados de Carga
- Loading durante verificación de sesión
- Loading durante actualización de contraseña
- Feedback visual de éxito/error

## 🔧 Mantenimiento

### Verificar Usuarios Pendientes
```sql
-- Ver usuarios que no han completado onboarding
SELECT u.email, p.created_at 
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.onboarding_completed = FALSE;
```

### Forzar Re-onboarding (Emergencia)
```sql
-- Marcar usuario para re-onboarding
UPDATE profiles 
SET onboarding_completed = FALSE 
WHERE id = 'user-uuid-here';
```

## 🚨 Notas Importantes

1. **Usuarios Existentes**: Se marcan automáticamente como onboarding completado
2. **Nuevos Usuarios**: Requieren onboarding obligatorio
3. **Backup**: Hacer backup antes de ejecutar scripts SQL
4. **Testing**: Probar con usuario de prueba antes de producción

## 📞 Soporte

Si hay problemas con la implementación:
1. Verificar que el script SQL se ejecutó correctamente
2. Revisar logs de Supabase para errores
3. Verificar políticas RLS
4. Comprobar que los triggers están activos
