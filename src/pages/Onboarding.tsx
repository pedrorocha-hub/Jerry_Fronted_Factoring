import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Onboarding = () => {
  const { user, refreshProfile } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const validateForm = (fullName: string, password: string): string[] => {
    const errors: string[] = [];
    
    // Validar nombre completo
    if (!fullName.trim()) {
      errors.push('El nombre completo es obligatorio');
    } else if (fullName.trim().length < 2) {
      errors.push('El nombre completo debe tener al menos 2 caracteres');
    }
    
    // Validar contraseña
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Validar formulario completo
    const validationErrors = validateForm(fullName, password);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrors(['Las contraseñas no coinciden']);
      setLoading(false);
      return;
    }

    try {
      // Actualizar contraseña del usuario
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Actualizar perfil con nombre completo y marcar onboarding como completado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName.trim(),
          onboarding_completed: true 
        })
        .eq('id', user?.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw new Error('Error al actualizar el perfil');
      }

      // Forzar actualización de la sesión y el perfil
      await supabase.auth.refreshSession();
      
      // Refrescar el perfil en el contexto
      await refreshProfile();

      setSuccess(true);
      showSuccess('¡Bienvenido! Tu cuenta ha sido configurada correctamente.');
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('Error during onboarding:', error);
      setErrors([error.message || 'Error al configurar tu cuenta. Por favor, intenta nuevamente.']);
      showError('Error al configurar tu cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-[#121212] border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-[#00FF80] mx-auto" />
              <h2 className="text-2xl font-bold text-white">¡Bienvenido!</h2>
              <p className="text-gray-400">
                Tu cuenta ha sido configurada correctamente. 
                Serás redirigido al dashboard en unos segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Card className="w-full max-w-md bg-[#121212] border-gray-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://www.pescholar.com/wp-content/uploads/2024/03/cyber-brain-7633488_1280.jpg" 
              alt="Upgrade AI" 
              className="h-16 w-16 rounded-lg object-cover"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Upgrade AI</CardTitle>
          <CardDescription className="text-gray-400">
            Bienvenido! Completa la configuración de tu cuenta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-[#1f2937] border-gray-600 text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="fullName" className="text-gray-300">
                  Nombre completo *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#1f2937] border-gray-600 text-white"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">
                  Nueva contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1f2937] border-gray-600 text-white"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirmar contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#1f2937] border-gray-600 text-white"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </div>
            </div>

            {errors.length > 0 && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF80] hover:bg-[#00E673] text-black font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando cuenta...
                </>
              ) : (
                'Completar configuración'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">Requisitos:</h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Nombre completo: Mínimo 2 caracteres</li>
              <li>• Contraseña: Mínimo 8 caracteres</li>
              <li>• Al menos una letra mayúscula</li>
              <li>• Al menos una letra minúscula</li>
              <li>• Al menos un número</li>
              <li>• Al menos un carácter especial</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
