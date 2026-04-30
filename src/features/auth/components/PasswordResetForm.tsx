import React, { useState, useEffect } from 'react';
import * as apiService from '@/shared/services/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
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
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos

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
      setError('El código de recuperación ha expirado. Solicita uno nuevo.');
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl text-white font-bold mb-2 flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-yellow-500" />
          Nueva Contraseña
        </h2>
        <p className="text-base text-gray-400">
          Para tu cuenta: <strong className="text-white font-medium">{userEmail}</strong>
        </p>
      </div>

      <div className="space-y-6">
        {/* Contador de tiempo */}
        <div className={`p-4 rounded-xl border ${isExpired ? 'border-red-500/30 bg-red-500/10' : 'border-gray-800 bg-black/30'}`}>
          <div className={`flex items-center justify-between font-medium ${isExpired ? 'text-red-400' : 'text-yellow-500'}`}>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{isExpired ? 'Código expirado' : 'Tiempo restante:'}</span>
            </div>
            <span className="font-mono text-lg tracking-wider">{isExpired ? '00:00:00' : formatTime(timeLeft)}</span>
          </div>
          {isExpired && (
            <div className="mt-3 text-xs text-red-400">
              Por seguridad, el código solo es válido por 15 minutos.
              <Button
                variant="link"
                className="p-0 h-auto text-red-300 hover:text-red-200 ml-1 underline font-semibold"
                onClick={onCancel}
              >
                Solicita uno nuevo
              </Button>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 rounded-xl">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400 text-sm font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Código de recuperación */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-gray-300 text-base font-medium">Código de recuperación</Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ingresa el código enviado a tu correo"
              disabled={isExpired || isLoading}
              required
              className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-12 text-base px-4 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ingresa el código que recibiste en tu email (revisa también spam).
            </p>
          </div>

          {/* Nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-300 text-base font-medium">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                className="pr-10 bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-12 text-base px-4 transition-all"
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
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Fortaleza:</span>
                  <span className={`text-xs font-semibold ${passwordStrength.score >= 4 ? 'text-green-400' :
                    passwordStrength.score >= 3 ? 'text-blue-400' :
                      passwordStrength.score >= 2 ? 'text-yellow-400' :
                        'text-red-400'
                    }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress
                  value={(passwordStrength.score / 5) * 100}
                  className="h-1.5 bg-gray-800"
                  indicatorClassName={passwordStrength.color}
                />
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-[11px] text-gray-400 mt-2">
                    <ul className="list-disc list-inside space-y-0.5">
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
            <Label htmlFor="confirmPassword" className="text-gray-300 text-base font-medium">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repite la contraseña"
                className="pr-10 bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-12 text-base px-4 transition-all"
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
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {/* Información de seguridad */}
          <div className="mt-6 text-xs text-gray-400 bg-black/30 border border-gray-800 p-4 rounded-xl leading-relaxed">
            <div className="flex items-center gap-2 mb-2 text-yellow-500 font-medium">
              <Shield className="h-4 w-4" />
              <span>Recomendaciones de seguridad:</span>
            </div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Usa combinación de letras, números y símbolos.</li>
              <li>No reutilices contraseñas antiguas.</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="pt-6 flex flex-row items-center justify-between space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-12 text-base text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-gray-800"
            >
              Atrás
            </Button>
            <Button
              type="submit"
              disabled={isExpired || isLoading || passwordStrength.score < 3 || !passwordsMatch}
              className="flex-1 h-12 text-base bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                  Cargando...
                </>
              ) : (
                <>
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
