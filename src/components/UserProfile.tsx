import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Save,
  Eye,
  EyeOff,
  Crown,
  Briefcase,
  UserCircle,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    numeroDocumento: user?.numeroDocumento || '',
    tipoDocumento: user?.tipoDocumento || 'C.C',
    telefono: user?.telefono || '',
    ciudad: user?.ciudad || '',
    direccion: user?.direccion || '',
    barrio: user?.barrio || '',
    fechaNacimiento: user?.fechaNacimiento || ''
  });

  const { updateUser } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role.name) {
      case 'Administrador': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'Empleado': return <Briefcase className="h-5 w-5 text-blue-500" />;
      default: return <UserCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      username: profileData.username,
      numeroDocumento: profileData.numeroDocumento,
      tipoDocumento: profileData.tipoDocumento,
      telefono: profileData.telefono,
      ciudad: profileData.ciudad,
      direccion: profileData.direccion,
      barrio: profileData.barrio,
      fechaNacimiento: profileData.fechaNacimiento
    };

    const success = await updateUser(updatedUser);
    if (success) {
      toast.success('Perfil actualizado', {
        description: 'Tu información personal ha sido actualizada correctamente.'
      });
      setIsEditing(false);
    } else {
      toast.error('Error al actualizar', {
        description: 'No se pudo actualizar el perfil. Intenta nuevamente.'
      });
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Error', { description: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Error', { description: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmPasswordUpdate = async () => {
    if (!user) return;
    setIsConfirmDialogOpen(false);

    const updatedUser = {
      ...user,
      password: passwordData.newPassword
    };

    const success = await updateUser(updatedUser);
    if (success) {
      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña ha sido cambiada exitosamente.'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      toast.error('Error', {
        description: 'No se pudo actualizar la contraseña. Intenta nuevamente.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Profile Header */}
      <Card className="bg-white border-yellow-400/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black text-3xl font-bold shadow-lg ring-4 ring-yellow-400/30">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className="flex items-center space-x-1 bg-yellow-400 text-black border-0 px-3 py-1">
                    {getRoleIcon()}
                    <span className="font-semibold">{user.role.name}</span>
                  </Badge>
                  {user.role.name === 'Cliente' && user.tipoCliente && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-400/40 px-3 py-1">
                      <UserCircle className="h-4 w-4 mr-1" />
                      {user.tipoCliente}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-lg">{user.email}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="profile" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <User className="h-4 w-4 mr-2" />
            Información Personal
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          {user.role.name !== 'Cliente' && (
            <TabsTrigger value="permissions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Shield className="h-4 w-4 mr-2" />
              Permisos y Rol
            </TabsTrigger>
          )}
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="profile">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-gray-900 text-2xl">Información Personal</CardTitle>
                  <CardDescription className="text-gray-600">
                    Actualiza tu información de perfil aquí
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-black">
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {success && (
                <Alert className="border-green-400 bg-green-50">
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-400 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento" className="text-gray-700">Tipo de Documento</Label>
                  <Input
                    id="tipoDocumento"
                    value={profileData.tipoDocumento}
                    onChange={(e) => setProfileData({ ...profileData, tipoDocumento: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroDocumento" className="text-gray-700">Número de Documento</Label>
                  <Input
                    id="numeroDocumento"
                    value={profileData.numeroDocumento}
                    onChange={(e) => setProfileData({ ...profileData, numeroDocumento: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">Nombre</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">Apellido</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-gray-700">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={profileData.telefono}
                    onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ciudad" className="text-gray-700">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={profileData.ciudad}
                    onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barrio" className="text-gray-700">Barrio</Label>
                  <Input
                    id="barrio"
                    value={profileData.barrio}
                    onChange={(e) => setProfileData({ ...profileData, barrio: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-gray-700">Dirección</Label>
                <Input
                  id="direccion"
                  value={profileData.direccion}
                  onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento" className="text-gray-700">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={profileData.fechaNacimiento}
                    onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-50 border-gray-300 text-gray-900 disabled:opacity-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-6">
                  <Button onClick={handleProfileUpdate} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900 text-2xl">Seguridad de la Cuenta</CardTitle>
              <CardDescription className="text-gray-600">
                Cambia tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {success && (
                <Alert className="border-yellow-400 bg-yellow-50">
                  <AlertDescription className="text-yellow-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Ingresa tu contraseña actual"
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-yellow-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Ingresa tu nueva contraseña"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirma tu nueva contraseña"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>

              <div className="pt-4">
                <Button onClick={handlePasswordUpdate} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  <Shield className="h-4 w-4 mr-2" />
                  Actualizar Contraseña
                </Button>
              </div>

              {/* Security Info */}
              <div className="bg-gradient-to-br from-yellow-50 to-gray-50 p-6 rounded-lg border border-yellow-400/30">
                <h4 className="text-yellow-700 font-semibold mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Recomendaciones de Seguridad:
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">•</span>
                    Usa al menos 8 caracteres
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">•</span>
                    Incluye números y símbolos
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">•</span>
                    Evita información personal
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">•</span>
                    No reutilices contraseñas
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-gray-900 text-2xl">
                {getRoleIcon()}
                <span>Mi Rol: {user.role.name}</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Información sobre tu rol y permisos en el sistema
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <h4 className="text-yellow-700 font-semibold mb-3">Descripción del Rol:</h4>
                <p className="text-gray-700">{user.role.description}</p>
              </div>

              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Permisos Asignados ({user.role.permissions.length}):</h4>
                <div className="space-y-3">
                  {user.role.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-yellow-400/20 rounded-lg hover:border-yellow-400 transition-all">
                      <div>
                        <div className="text-gray-900 font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{permission.description}</div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-400/40">
                        {permission.module}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Alert className="border-yellow-400/40 bg-yellow-50">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-gray-700">
                  Los permisos son gestionados por los administradores del sistema.
                  Si necesitas acceso adicional, contacta a tu administrador.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Password Change */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-500" />
              ¿Confirmar cambio de contraseña?
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cambiar tu contraseña? Se cerrará la sesión actual para aplicar los cambios de seguridad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPasswordUpdate}
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
            >
              Confirmar Cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};
