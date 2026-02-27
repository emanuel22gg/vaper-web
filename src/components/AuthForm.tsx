import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { UserRole } from '../types';
import { toast } from "sonner";
import { PasswordRecoveryEmail } from './PasswordRecoveryEmail';
import { PasswordResetForm } from './PasswordResetForm';
import * as apiService from '../services/api';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Estados para login
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Estados para recuperar contraseña
  const [recoveryData, setRecoveryData] = useState({
    email: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(loginData.username, loginData.password);
      if (!success) {
        setError('Credenciales incorrectas. Intenta nuevamente.');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para detectar el tipo de input
  const getInputType = (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? 'email' : 'documento';
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryData.email)) {
      setError('El formato del email no es válido.');
      setIsLoading(false);
      return;
    }

    const emailTrimmed = recoveryData.email.trim();

    try {
      // Llamada real al servicio de recuperación de la API
      await apiService.forgotPassword({ correo: emailTrimmed });

      // Ya no generamos un token falso. El usuario ingresará el que llega al correo.
      setResetToken('');

      setSuccess('Se ha enviado un código de recuperación a tu correo. Por favor, ingrésalo a continuación.');
      setSentEmail(emailTrimmed);

      // Saltamos la simulación del email y vamos directo al formulario de reset
      setShowPasswordReset(true);

      toast.success('Código enviado', {
        description: 'Revisa tu bandeja de entrada (y la carpeta de spam).'
      });
    } catch (err: any) {
      console.error('Error en forgotPassword:', err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error desconocido';
      setError(`Error: ${errorMessage}. Verifica que el correo sea correcto e intenta de nuevo.`);
      toast.error('Error', {
        description: `No se pudo enviar la solicitud: ${typeof errorMessage === 'string' ? errorMessage : 'Error del servidor'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToPasswordReset = () => {
    setShowEmailPreview(false);
    setShowPasswordReset(true);
  };

  const handlePasswordResetSuccess = () => {
    // Resetear todos los estados
    setShowPasswordReset(false);
    setShowEmailPreview(false);
    setShowRecovery(false);
    setSuccess('');
    setError('');
    setRecoveryData({ email: '' });
    setSentEmail('');
    setResetToken('');
  };

  const handlePasswordResetCancel = () => {
    setShowPasswordReset(false);
    setShowEmailPreview(false);
    setShowRecovery(false);
    setSuccess('');
    setError('');
    setRecoveryData({ email: '' });
    setSentEmail('');
    setResetToken('');
  };

  const handleCloseEmailPreview = () => {
    setShowEmailPreview(false);
    setShowRecovery(false);
    setSuccess('');
    setError('');
    setRecoveryData({ email: '' });
    setSentEmail('');
    setResetToken('');
  };

  // Si estamos en el flujo de cambio de contraseña, mostrar el componente correspondiente
  if (showPasswordReset) {
    return (
      <PasswordResetForm
        userEmail={sentEmail}
        resetToken={resetToken}
        onSuccess={handlePasswordResetSuccess}
        onCancel={handlePasswordResetCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl text-yellow-400 mb-2">Vaper One Medellín</h1>
          <p className="text-white/70">Sistema de Gestión</p>
        </div>

        {/* Login */}
        {!showRecovery ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Bienvenido de vuelta</CardTitle>
              <CardDescription className="text-gray-400">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Documento o Email</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Documento de identidad o correo electrónico"
                    required
                  />
                </div>

                <div className="space-y-2 mb-8">
                  <Label htmlFor="password" className="text-white">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-600 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="text-yellow-400 hover:text-yellow-300"
                  onClick={() => setShowRecovery(true)}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recuperar Contraseña</CardTitle>
              <CardDescription className="text-gray-400">
                Ingresa tu email para recibir las instrucciones de recuperación
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRecoverPassword}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-500 bg-green-500/10">
                    <AlertDescription className="text-green-400">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-white">Email</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={recoveryData.email}
                    onChange={(e) => setRecoveryData({ ...recoveryData, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded">
                  <div className="mb-1">📧 <strong>Proceso de recuperación:</strong></div>
                  <div>• Recibirás un email con un enlace de recuperación</div>
                  <div>• El enlace será válido por 1 hora</div>
                  <div>• Revisa también tu carpeta de spam</div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                  onClick={handlePasswordResetCancel}
                >
                  Volver al inicio de sesión
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
