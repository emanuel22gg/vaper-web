import React, { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import * as apiService from '@/shared/services/api';
import { toast } from "sonner";
import { Upload, CheckCircle, FileImage, X } from 'lucide-react';
import { DepartmentColombian, CityColombian } from '@/shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/shared/ui/utils";

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onCancel }) => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
  const [cities, setCities] = useState<CityColombian[]>([]);
  const [isDeptPopoverOpen, setIsDeptPopoverOpen] = useState(false);
  const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    documento: '',
    email: '',
    password: '',
    telefono: '',
    departamento: '',
    ciudad: '',
    barrio: '',
    direccion: '',
    fechaNacimiento: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await apiService.getDepartments();
        setDepartments([...data].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    fetchDepartments();
  }, []);

  React.useEffect(() => {
    if (registerData.departamento) {
      const fetchCities = async () => {
        try {
          const dept = departments.find(d => d.name === registerData.departamento);
          if (dept) {
            const data = await apiService.getCitiesByDepartment(dept.id);
            setCities([...data].sort((a, b) => a.name.localeCompare(b.name)));
          }
        } catch (err) {
          console.error("Error fetching cities", err);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [registerData.departamento, departments]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!imageFile) {
        setError('Debes adjuntar un comprobante o foto de tu documento de identidad para validar la mayoría de edad.');
        setIsLoading(false);
        return;
      }

      // 1. Subir la imagen
      let documentoUrl = '';
      try {
        const uploadResult = await apiService.uploadImage(imageFile);
        documentoUrl = uploadResult.urlimagen;
      } catch (err) {
        console.error('Error uploading image', err);
        setError('Hubo un error al subir la imagen del documento.');
        setIsLoading(false);
        return;
      }

      // 2. Registrar usuario (se creará inactivo)
      const success = await register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        username: registerData.documento,
        email: registerData.email,
        password: registerData.password,
        role: 'Cliente',
        documentoUrl,
        telefono: registerData.telefono,
        departamento: registerData.departamento,
        ciudad: registerData.ciudad,
        barrio: registerData.barrio,
        direccion: registerData.direccion,
        fechaNacimiento: registerData.fechaNacimiento
      });

      if (success) {
        toast.success('Registro completado', {
          description: 'Tu cuenta ha sido creada. Un administrador revisará tu documento para activarla.'
        });
        if (onSuccess) onSuccess();
      } else {
        setError('Error en el registro. Es posible que el correo o documento ya estén en uso.');
      }
    } catch (err: any) {
      console.error('Error registering user:', err);
      setError('Error inesperado durante el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 text-center">
        <h2 className="text-xl text-white font-semibold mb-1">Crea tu cuenta</h2>
        <p className="text-sm text-gray-400">Ingresa tus datos para registrarte</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 text-red-400 py-2 rounded-xl mb-3">
              <AlertDescription className="text-sm font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Fila 1: Nombres, Apellidos, Documento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-gray-300 text-xs font-medium">Nombres *</Label>
              <Input
                id="firstName"
                required
                value={registerData.firstName}
                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Tus nombres"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-gray-300 text-xs font-medium">Apellidos *</Label>
              <Input
                id="lastName"
                required
                value={registerData.lastName}
                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Tus apellidos"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="documento" className="text-gray-300 text-xs font-medium">Documento *</Label>
              <Input
                id="documento"
                required
                value={registerData.documento}
                onChange={(e) => setRegisterData({ ...registerData, documento: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Ej. 1000000000"
              />
            </div>
          </div>

          {/* Fila 2: Email, Password, Fecha Nac */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300 text-xs font-medium">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                required
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-300 text-xs font-medium">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                required
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Crea contraseña"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fechaNacimiento" className="text-gray-300 text-xs font-medium">F. Nacimiento *</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                required
                value={registerData.fechaNacimiento}
                onChange={(e) => setRegisterData({ ...registerData, fechaNacimiento: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Fila 3: Telefono, Departamento, Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-gray-300 text-xs font-medium">Teléfono *</Label>
              <Input
                id="telefono"
                required
                value={registerData.telefono}
                onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Ej. 3001234567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="departamento" className="text-gray-300 text-xs font-medium">Depto (Opcional)</Label>
              <Popover open={isDeptPopoverOpen} onOpenChange={setIsDeptPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isDeptPopoverOpen}
                    className="w-full justify-between bg-black/50 border-gray-700 text-white hover:bg-gray-800 hover:text-white rounded-xl h-9 text-sm transition-all"
                  >
                    <span className="truncate">
                      {registerData.departamento
                        ? departments.find((dept) => dept.name === registerData.departamento)?.name
                        : "Seleccionar"}
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50 text-white" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 bg-gray-900 border-gray-700 text-white rounded-xl"
                >
                  <Command className="bg-gray-900 text-white rounded-xl">
                    <CommandInput placeholder="Buscar..." className="text-white placeholder:text-gray-400 border-b border-gray-800 h-9 text-sm" />
                    <CommandList className="custom-scrollbar max-h-40">
                      <CommandEmpty>No se encontró.</CommandEmpty>
                      <CommandGroup>
                        {departments.map((dept) => (
                          <CommandItem
                            key={dept.id}
                            value={dept.name}
                            onSelect={() => {
                              setRegisterData({ ...registerData, departamento: dept.name, ciudad: '' });
                              setIsDeptPopoverOpen(false);
                            }}
                            className="text-sm text-white hover:bg-gray-800 cursor-pointer aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3 w-3",
                                registerData.departamento === dept.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ciudad" className="text-gray-300 text-xs font-medium">Ciudad (Opcional)</Label>
              <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCityPopoverOpen}
                    disabled={!registerData.departamento}
                    className="w-full justify-between bg-black/50 border-gray-700 text-white hover:bg-gray-800 hover:text-white disabled:opacity-50 rounded-xl h-9 text-sm transition-all"
                  >
                    <span className="truncate">
                      {registerData.ciudad
                        ? cities.find((city) => city.name === registerData.ciudad)?.name
                        : registerData.departamento ? "Seleccionar" : "Depto primero"}
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50 text-white" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 bg-gray-900 border-gray-700 text-white rounded-xl"
                >
                  <Command className="bg-gray-900 text-white rounded-xl">
                    <CommandInput placeholder="Buscar..." className="text-white placeholder:text-gray-400 border-b border-gray-800 h-9 text-sm" />
                    <CommandList className="custom-scrollbar max-h-40">
                      <CommandEmpty>No se encontró.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              setRegisterData({ ...registerData, ciudad: city.name });
                              setIsCityPopoverOpen(false);
                            }}
                            className="text-sm text-white hover:bg-gray-800 cursor-pointer aria-selected:bg-gray-800"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3 w-3",
                                registerData.ciudad === city.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Fila 4: Barrio, Direccion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="barrio" className="text-gray-300 text-xs font-medium">Barrio (Opcional)</Label>
              <Input
                id="barrio"
                value={registerData.barrio}
                onChange={(e) => setRegisterData({ ...registerData, barrio: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Ej. Laureles"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="direccion" className="text-gray-300 text-xs font-medium">Dirección (Opcional)</Label>
              <Input
                id="direccion"
                value={registerData.direccion}
                onChange={(e) => setRegisterData({ ...registerData, direccion: e.target.value })}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Ej. Calle 10 #20-30"
              />
            </div>
          </div>

          {/* Fila 5: Comprobante */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-xs font-medium flex justify-between">
              <span>Foto de Documento *</span>
              <span className="text-red-400 text-right">Obligatorio (Mayoría de edad, documento por ambos lados)</span>
            </Label>
            {!imageFile ? (
              <div className="flex justify-center px-4 py-3 border border-yellow-500/30 border-dashed rounded-xl bg-black/30 hover:bg-black/50 hover:border-yellow-500/50 transition-all">
                <div className="flex items-center space-x-3 text-center">
                  <Upload className="h-5 w-5 text-yellow-500/80" />
                  <div className="text-sm text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer font-medium text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                      <span>Seleccionar archivo</span>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 border border-green-500/40 rounded-xl bg-green-500/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex-shrink-0">
                    {imageFile.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="h-8 w-8 object-cover rounded-md border border-green-400/50"
                      />
                    ) : (
                      <FileImage className="h-6 w-6 text-green-500/80" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-green-400 flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Listo: <span className="text-gray-300 ml-1 truncate max-w-[120px]">{imageFile.name}</span>
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                  onClick={() => setImageFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex flex-row items-center justify-between space-x-4">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 h-11 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-gray-800"
            onClick={onCancel}
          >
            Atrás
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Registrarse'}
          </Button>
        </div>
      </form>
    </div>
  );
};
