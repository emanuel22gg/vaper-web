import React from 'react';
import { Role } from '@/shared/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Shield, CheckCircle, XCircle, Crown, Briefcase, UserCircle } from 'lucide-react';

interface RoleDetailDialogProps {
  role: Role | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoleDetailDialog: React.FC<RoleDetailDialogProps> = ({
  role,
  isOpen,
  onOpenChange
}) => {
  if (!role) return null;

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Administrador': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'Empleado': return <Briefcase className="h-5 w-5 text-blue-500" />;
      default: return <UserCircle className="h-5 w-5 text-green-500" />;
    }
  };

  // Agrupar permisos por módulo
  const groupedPermissions = role.permissions.reduce((groups, permission) => {
    const module = permission.module;
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, typeof role.permissions>);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getRoleIcon(role.name)}
            <div className="flex-1">
              <DialogTitle className="text-xl">Detalles del Rol</DialogTitle>
              <DialogDescription>
                Información completa del rol {role.name} incluyendo permisos y configuración
              </DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={role.isActive ? "default" : "secondary"} className="text-xs">
                  {role.isActive ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Activo</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Inactivo</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {role.name}
                </CardTitle>
                <CardDescription>
                  {role.description || 'Sin descripción disponible'}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Permisos por módulo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Permisos ({role.permissions.length})
                </CardTitle>
                <CardDescription>
                  Funcionalidades disponibles para este rol organizadas por módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedPermissions).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Este rol no tiene permisos asignados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, permissions]) => (
                      <div key={module} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium capitalize">{module}</h4>
                          <Badge variant="outline" className="text-xs">
                            {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                            >
                              <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium">{permission.name}</div>
                                {permission.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
