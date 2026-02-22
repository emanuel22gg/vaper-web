import React, { useState, useEffect } from 'react';
import * as apiService from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Shield,
  ArrowLeft,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { toast } from "sonner";

interface PasswordResetFormProps {
  userEmail: string;
  resetToken: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  userEmail,
  resetToken,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    code: resetToken || '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hora en segundos

  // Simulación del tiempo de expiración
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Validación de fortaleza de contraseña
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length === 0) {
      return { score: 0, feedback: ['Ingresa una contraseña'], color: 'bg-gray-300', label: '' };
    }

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Mínimo 8 caracteres');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Una letra minúscula');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Una letra mayúscula');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Un número');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Un carácter especial (!@#$%^&*)');
    }

    let color = 'bg-red-500';
    let label = 'Muy débil';

    if (score >= 5) {
      color = 'bg-green-500';
      label = 'Muy fuerte';
    } else if (score >= 4) {
      color = 'bg-blue-500';
      label = 'Fuerte';
    } else if (score >= 3) {
      color = 'bg-yellow-500';
      label = 'Media';
    } else if (score >= 2) {
      color = 'bg-orange-500';
      label = 'Débil';
    }

    return { score, feedback, color, label };
  };

  const passwordStrength = checkPasswordStrength(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (timeLeft <= 0) {
      setError('El enlace de recuperación ha expirado. Solicita uno nuevo.');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('La contraseña debe ser más fuerte. Revisa los requisitos.');
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada real al servicio de restablecimiento de contraseña de la API
      await apiService.resetPassword({
        correo: userEmail,
        codigo: formData.code,
        nuevaContraseña: formData.newPassword
      });

      toast.success('¡Contraseña actualizada exitosamente!', {
        description: 'Ahora puedes iniciar sesión con tu nueva contraseña.'
      });

      onSuccess();
    } catch (err) {
      setError('El código es inválido o ha expirado. Por favor, verifica el código enviado a tu correo e intenta de nuevo.');
      toast.error('Error al cambiar contraseña', {
        description: 'No se pudo actualizar la contraseña. Revisa el código e inténtalo de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Restablecer contraseña
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vaper One Medellín - Sistema de Gestión
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Nueva contraseña
            </CardTitle>
            <CardDescription>
              Define una contraseña segura para tu cuenta: <strong>{userEmail}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contador de tiempo */}
            <Alert className={`${isExpired ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'}`}>
              <Timer className={`h-4 w-4 ${isExpired ? 'text-red-600' : 'text-amber-600'}`} />
              <AlertDescription className={isExpired ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}>
                <div className="flex items-center justify-between">
                  <span>
                    {isExpired ? 'Enlace expirado' : 'Tiempo restante del código:'}
                  </span>
                  <span className="font-mono font-semibold">
                    {isExpired ? '00:00:00' : formatTime(timeLeft)}
                  </span>
                </div>
                {isExpired && (
                  <div className="mt-2 text-sm">
                    Por seguridad, el código solo es válido por 1 hora.
                    <Button
                      variant="link"
                      className="p-0 h-auto text-red-600 dark:text-red-400 underline"
                      onClick={onCancel}
                    >
                      Solicita uno nuevo
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Código de recuperación */}
              <div className="space-y-2">
                <Label htmlFor="code">Código de recuperación</Label>
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ingresa el código enviado a tu correo"
                  disabled={isExpired || isLoading}
                  required
                />
                <p className="text-[10px] text-gray-500">
                  Ingresa el código que recibiste en tu email (revisa también spam).
                </p>
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="pr-10"
                    disabled={isExpired || isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isExpired || isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                {/* Indicador de fortaleza */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Fortaleza:
                      </span>
                      <span className={`text-sm font-medium ${passwordStrength.score >= 4 ? 'text-green-600' :
                        passwordStrength.score >= 3 ? 'text-blue-600' :
                          passwordStrength.score >= 2 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress
                      value={(passwordStrength.score / 5) * 100}
                      className="h-2"
                    />
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p>Requisitos faltantes:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repite la contraseña"
                    className="pr-10"
                    disabled={isExpired || isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isExpired || isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  {formData.confirmPassword && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {/* Información de seguridad */}
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="text-sm space-y-1">
                    <div className="font-medium">Recomendaciones de seguridad:</div>
                    <div>• Usa una combinación de letras, números y símbolos</div>
                    <div>• No reutilices contraseñas de otras cuentas</div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isExpired || isLoading || passwordStrength.score < 3 || !passwordsMatch}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2 flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Cambiar contraseña
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Vaper One Medellín - Sistema seguro de gestión</p>
        </div>
      </div>
    </div>
  );
};
