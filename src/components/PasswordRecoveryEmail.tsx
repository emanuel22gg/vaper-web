import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Mail,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
  Lock,
  User,
  Calendar,
  Globe
} from 'lucide-react';

interface PasswordRecoveryEmailProps {
  userEmail: string;
  onResetPassword: () => void;
  onClose: () => void;
}

export const PasswordRecoveryEmail: React.FC<PasswordRecoveryEmailProps> = ({
  userEmail,
  onResetPassword,
  onClose
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Generar token simulado y fecha de expiración
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos desde ahora
  const currentTime = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header del simulador */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm mb-4">
            <Globe className="h-4 w-4" />
            Simulación de Email - Cliente de Correo
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Vista previa del correo electrónico
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Así es como recibirás el mensaje de recuperación en tu bandeja de entrada
          </p>
        </div>

        {/* Simulación del cliente de correo */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Header del email simulado */}
          <div className="bg-gray-50 dark:bg-gray-800 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Gmail</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cliente de correo</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Entregado
              </Badge>
            </div>
          </div>

          {/* Información del email */}
          <div className="bg-white dark:bg-gray-900 border-b px-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">De:</span>
                  <span className="font-medium text-gray-900 dark:text-white">noreply@vaperonemed.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {currentTime.toLocaleString('es-ES')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Para:</span>
                <span className="font-medium text-gray-900 dark:text-white">{userEmail}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Asunto:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  🔐 Recuperación de contraseña - Vaper One Medellín
                </span>
              </div>
            </div>
          </div>

          {/* Contenido del email */}
          <CardContent className="p-0">
            <div className="bg-white dark:bg-gray-900 p-8">
              {/* Header del contenido */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Vaper One Medellín
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Sistema de Gestión Empresarial
                </p>
              </div>

              {/* Mensaje principal */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Solicitud de recuperación de contraseña
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Hola,
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada
                  con este correo electrónico. Si fuiste tú quien hizo esta solicitud, haz clic en
                  el botón de abajo para continuar con el proceso.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                </p>
              </div>

              {/* Botón de acción principal */}
              <div className="text-center mb-6">
                <Button
                  onClick={onResetPassword}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Restablecer mi contraseña
                  <ExternalLink className={`h-4 w-4 ml-2 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Este código te permitirá cambiar tu contraseña en el formulario
                </p>
              </div>

              <Separator className="my-6" />

              {/* Información de seguridad */}
              <div className="space-y-4">
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <div className="space-y-2">
                      <div className="font-medium">Información importante de seguridad:</div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Este código expira el {expirationTime.toLocaleString('es-ES')}</span>
                        </div>
                        <div>• Solo funciona una vez - después se invalidará automáticamente</div>
                        <div>• El código es único y personal, no lo compartas con nadie</div>
                        <div>• Si no fuiste tú, cambia tu contraseña inmediatamente</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Token de seguridad (solo para demostración) */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Token de seguridad (solo visible en esta simulación):
                  </div>
                  <code className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded break-all">
                    {resetToken}
                  </code>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Footer del email */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p>
                  Este correo fue enviado desde una dirección de solo envío.
                  Por favor no respondas a este mensaje.
                </p>
                <p>
                  © 2024 Vaper One Medellín - Sistema de Gestión Empresarial
                </p>
                <p className="text-xs">
                  Si tienes problemas, asegúrate de ingresar el código correctamente en el formulario:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono break-all">
                  https://sistema.vaperonemed.com/reset-password?token={resetToken.substring(0, 20)}...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles del simulador */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            Cerrar simulación
          </Button>
          <Button
            onClick={onResetPassword}
            className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Ir al formulario de cambio
          </Button>
        </div>

        {/* Nota informativa */}
        <Alert className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <span>💡</span>
              <div>
                <strong>Esto es una simulación educativa.</strong> En un entorno real,
                este email llegaría a tu bandeja de entrada y el código te permitiría
                al sitio web oficial de la empresa para cambiar tu contraseña de forma segura.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
