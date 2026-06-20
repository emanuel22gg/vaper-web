import React, { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { UserRole } from '@/shared/types';
import { toast } from "sonner";
import { PasswordRecoveryEmail } from './PasswordRecoveryEmail';
import { PasswordResetForm } from './PasswordResetForm';
import { RegisterForm } from './RegisterForm';
import * as apiService from '@/shared/services/api';
import logoImage from '@/assets/logo_vaper_bee.jpg';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [showRegister, setShowRegister] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (lockoutTime === 0 && failedAttempts >= 3) {
      setFailedAttempts(0);
    }
    return () => clearInterval(timer);
  }, [lockoutTime, failedAttempts]);

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
    if (lockoutTime > 0) return;

    setIsLoading(true);
    setError('');

    try {
      await login(loginData.username, loginData.password);
      setFailedAttempts(0);
      onSuccess?.();
    } catch (err: any) {
      console.error('Error en handleLogin:', err);
      if (err.message === 'UserNotFound') {
        setError('Usuario no encontrado');
        // No sumamos intentos fallidos porque el usuario no existe
      } else if (err.message === 'InvalidCredentials') {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
          setLockoutTime(30);
          setError('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
        } else {
          setError(`Credenciales incorrectas. Te quedan ${3 - newAttempts} intento(s).`);
        }
      } else if (err.message === 'UserDeactivated') {
        setError('Tu cuenta ha sido desactivada. Por favor, contacta al administrador.');
      } else if (err.message === 'UserPendingApproval') {
        setError('Tu cuenta aún no ha sido aprobada. Estamos verificando tu documento.');
      } else if (err.message === 'RoleDeactivated') {
        setError('Tu rol asignado ha sido desactivado. Por favor, contacta al administrador.');
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
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
    const emailLowerCase = emailTrimmed.toLowerCase();

    try {
      // 1. Verificar si el correo está registrado en el sistema
      const allUsers = await apiService.getUsuarios();
      const userExists = allUsers.find(u => u.correo.toLowerCase() === emailLowerCase);

      if (!userExists) {
        setError('El correo no está registrado');
        setIsLoading(false);
        return;
      }

      // 2. Si existe, llamar al servicio de recuperación
      await apiService.forgotPassword({ correo: emailTrimmed });

      // Ya no generamos un token falso. El usuario ingresará el que llega al correo.
      setResetToken('');

      setSuccess('Correo verificado. Se ha enviado un código de recuperación a tu bandeja de entrada.');
      setSentEmail(emailTrimmed);

      // Saltamos la simulación del email y vamos directo al formulario de reset
      setShowPasswordReset(true);

      toast.success('Código enviado', {
        description: 'Revisa tu bandeja de entrada para obtener el código de restablecimiento.'
      });
    } catch (err: any) {
      console.error('Error en el proceso de recuperación:', err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error desconocido';
      setError(`Error: ${errorMessage}. Intenta de nuevo más tarde.`);
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

  if (showPasswordReset) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative py-12 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-lg px-6 relative z-10 py-10">
          <div className="backdrop-blur-xl bg-gray-900/60 border border-gray-700/50 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/50 transition-all duration-500 ease-in-out">
            <PasswordResetForm
              userEmail={sentEmail}
              resetToken={resetToken}
              onSuccess={handlePasswordResetSuccess}
              onCancel={handlePasswordResetCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative py-12 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-4xl px-6 relative z-10 py-6">
          <div className="backdrop-blur-xl bg-gray-900/60 border border-gray-700/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/50 transition-all duration-500 ease-in-out">
            <RegisterForm 
              onSuccess={() => setShowRegister(false)} 
              onCancel={() => setShowRegister(false)} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative py-12 px-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg px-6 relative z-10 py-10">
        {/* Login / Recovery Form */}
        <div className="backdrop-blur-xl bg-gray-900/60 border border-gray-700/50 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black/50 transition-all duration-500 ease-in-out">
          {!showRecovery ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center">
                <h2 className="text-3xl text-white font-bold mb-2">Bienvenido</h2>
                <p className="text-base text-gray-400">Ingresa tus credenciales para acceder</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 100%)', border: '1px solid rgba(239,68,68,0.6)', borderLeft: '3px solid #ef4444', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <AlertCircle style={{ color: '#ef4444', width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ color: '#f1f1f1', fontSize: '13px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300 text-sm font-medium">Documento o Email</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-12 text-base px-4 transition-all"
                    placeholder="ej. 1000123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-12 text-base px-4 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="pt-4 space-y-5">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || lockoutTime > 0}
                  >
                    {isLoading ? 'Verificando...' : lockoutTime > 0 ? `Bloqueado (${lockoutTime}s)` : 'Iniciar Sesión'}
                  </Button>

                  <div className="flex flex-col space-y-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowRecovery(true)}
                      className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors font-medium focus:outline-none"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="text-yellow-500 hover:text-yellow-400 font-semibold text-base ml-1 transition-colors focus:outline-none"
                  >
                    Regístrate aquí
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center">
                <h2 className="text-2xl text-white font-bold mb-2">Recuperar Acceso</h2>
                <p className="text-base text-gray-400">Te enviaremos las instrucciones por email</p>
              </div>

              <form onSubmit={handleRecoverPassword} className="space-y-5">
                {error && (
                  <div style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 100%)', border: '1px solid rgba(239,68,68,0.6)', borderLeft: '3px solid #ef4444', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertCircle style={{ color: '#ef4444', width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ color: '#f1f1f1', fontSize: '13px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>{error}</p>
                  </div>
                )}

                {success && (
                  <div style={{ background: 'linear-gradient(135deg, #0a1a0f 0%, #0f2d18 100%)', border: '1px solid rgba(34,197,94,0.6)', borderLeft: '3px solid #22c55e', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 style={{ color: '#22c55e', width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ color: '#f1f1f1', fontSize: '13px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>{success}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-gray-300 text-sm font-medium">Correo Electrónico Registrado</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={recoveryData.email}
                    onChange={(e) => setRecoveryData({ ...recoveryData, email: e.target.value })}
                    className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-12 text-base px-4 transition-all"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="mt-6 text-xs text-gray-400 bg-black/30 border border-gray-800 p-4 rounded-xl leading-relaxed">
                  <span className="block mb-2 text-yellow-500 font-medium">Proceso de recuperación:</span>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Recibirás un código seguro por email.</li>
                    <li>El código expira en 15 minutos.</li>
                    <li>Por favor revisa tu carpeta de SPAM.</li>
                  </ul>
                </div>

                <div className="pt-6 flex flex-row items-center justify-between space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 h-12 text-base text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-gray-800"
                    onClick={handlePasswordResetCancel}
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : 'Enviar'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
