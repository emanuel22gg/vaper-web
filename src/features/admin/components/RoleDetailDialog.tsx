import React from 'react';
import { Role } from '@/shared/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Shield, CheckCircle, XCircle, Crown, Briefcase, UserCircle, Info, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/ui/utils";
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
        <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles del Rol</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Información de accesos y configuración del rol.
              </DialogDescription>
            </div>
            <Badge 
              variant="outline"
              className={cn(
                "px-3 py-1 rounded-full text-[12px] font-bold border-none text-white",
                role.isActive ? "bg-emerald-500" : "bg-gray-400"
              )}
            >
              {role.isActive ? "Rol Activo" : "Rol Inactivo"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-10">
          {/* Cabecera del Rol */}
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
              {getRoleIcon(role.name)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {role.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none hover:bg-gray-200 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> {role.permissions.length} Permisos Asignados
                </Badge>
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
              <TabsTrigger 
                value="info" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <Info className="h-4 w-4" /> Información General
              </TabsTrigger>
              <TabsTrigger 
                value="permisos" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <ShieldCheck className="h-4 w-4" /> Permisos ({role.permissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" /> Descripción del Rol
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {role.description || "Sin descripción disponible para este rol."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permisos" className="space-y-8 animate-in fade-in-50 duration-500">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                  <p className="text-gray-500 font-medium">Este rol no tiene permisos asignados.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <div key={module} className="bg-white border text-card-foreground shadow-sm rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
                        <h4 className="font-semibold capitalize text-gray-900">{module}</h4>
                        <Badge variant="outline" className="text-xs bg-white text-gray-500">
                          {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100"
                            >
                              <div className="bg-emerald-100 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm text-gray-900">{permission.name}</div>
                                {permission.description && (
                                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
