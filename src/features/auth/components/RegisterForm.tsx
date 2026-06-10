import React, { useState, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import * as apiService from '@/shared/services/api';
import { toast } from "sonner";
import { Upload, CheckCircle, FileImage, X, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { DepartmentColombian, CityColombian } from '@/shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/shared/ui/utils";
import { checkPasswordStrength } from '@/shared/utils/passwordStrength';
import { Progress } from '@/shared/ui/progress';

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Reglas de validación ──────────────────────────────────────────────────────
const ONLY_LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const ONLY_NUMBERS = /^\d+$/;
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function calcAge(dateStr: string): number {
  if (!dateStr) return 0;
  const today = new Date();
  const birth  = new Date(dateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function validateField(
  field: string,
  value: string,
  tipoDocumento?: string,
  existingUsers: any[] = []
): string {
  switch (field) {
    case 'firstName':
    case 'lastName': {
      if (!value.trim()) return 'Este campo es obligatorio.';
      if (value.trim().length < 2) return 'Mínimo 2 caracteres.';
      if (!ONLY_LETTERS.test(value)) return 'Solo se permiten letras.';
      return '';
    }
    case 'documento': {
      if (!value.trim()) return 'Este campo es obligatorio.';
      if (!ONLY_NUMBERS.test(value)) return 'Solo se permiten números.';
      const min = tipoDocumento === 'TI' ? 10 : 6;
      const max = tipoDocumento === 'TI' ? 11 : 10;
      if (value.length < min) return `Mínimo ${min} dígitos para ${tipoDocumento}.`;
      if (value.length > max) return `Máximo ${max} dígitos para ${tipoDocumento}.`;
      if (existingUsers.some(u => u.numeroDocumento === value)) return 'Este documento ya está registrado.';
      return '';
    }
    case 'email': {
      if (!value.trim()) return 'Este campo es obligatorio.';
      if (!EMAIL_REGEX.test(value)) return 'Ingresa un correo válido.';
      if (existingUsers.some(u => u.correo?.toLowerCase() === value.toLowerCase())) return 'Este correo ya está en uso.';
      return '';
    }
    case 'password': {
      if (!value) return 'Este campo es obligatorio.';
      return '';
    }
    case 'fechaNacimiento': {
      if (!value) return 'Este campo es obligatorio.';
      const age = calcAge(value);
      if (age < 18) return 'Debes ser mayor de 18 años.';
      if (age >= 80) return 'Debes ser menor de 80 años.';
      return '';
    }
    case 'telefono': {
      if (!value.trim()) return 'Este campo es obligatorio.';
      if (!ONLY_NUMBERS.test(value)) return 'Solo se permiten números.';
      if (value.length !== 10) return 'El teléfono debe tener 10 dígitos.';
      return '';
    }
    default:
      return '';
  }
}

const REQUIRED_FIELDS = ['firstName', 'lastName', 'documento', 'email', 'password', 'fechaNacimiento', 'telefono'] as const;
type RequiredField = typeof REQUIRED_FIELDS[number];

// ── Componente ────────────────────────────────────────────────────────────────
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onCancel }) => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
  const [cities, setCities] = useState<CityColombian[]>([]);
  const [isDeptPopoverOpen, setIsDeptPopoverOpen] = useState(false);
  const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    tipoDocumento: 'CC',
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

  // Errores por campo y campos que ya fueron tocados
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<RequiredField, boolean>>>({});
  const [existingUsers, setExistingUsers] = useState<any[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Marca el campo como tocado y valida al salir del foco
  const handleBlur = useCallback((field: RequiredField) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const msg = validateField(field, registerData[field], registerData.tipoDocumento, existingUsers);
    setFieldErrors(prev => ({ ...prev, [field]: msg }));
  }, [registerData, existingUsers]);

  // Actualiza el valor y valida en tiempo real si el campo ya fue tocado
  const handleChange = useCallback((field: RequiredField, value: string) => {
    setRegisterData(prev => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        const msg = validateField(field, value, next.tipoDocumento, existingUsers);
        setFieldErrors(fe => ({ ...fe, [field]: msg }));
      }
      return next;
    });
  }, [touched, existingUsers]);

  // Al cambiar tipo de documento, re-valida el número si ya fue tocado
  const handleTipoDocumentoChange = useCallback((value: string) => {
    setRegisterData(prev => {
      const next = { ...prev, tipoDocumento: value };
      if (touched['documento']) {
        const msg = validateField('documento', next.documento, value, existingUsers);
        setFieldErrors(fe => ({ ...fe, documento: msg }));
      }
      return next;
    });
  }, [touched, existingUsers]);

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await apiService.getDepartments();
        setDepartments([...data].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    const fetchUsersForValidation = async () => {
      try {
        const users = await apiService.getUsuarios();
        setExistingUsers(users);
      } catch (err) {
        console.error("Error fetching users for validation", err);
      }
    };
    fetchDepartments();
    fetchUsersForValidation();
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

  // Clases del input según estado de validación
  const inputClass = (field: RequiredField) => {
    const base = "bg-black/50 border text-white rounded-xl h-9 text-sm transition-all focus:ring-1";
    if (!touched[field]) return `${base} border-gray-700 focus:border-yellow-500 focus:ring-yellow-500`;
    
    if (field === 'password') {
      const score = checkPasswordStrength(registerData.password).score;
      if (score < 5) return `${base} border-red-500 focus:border-red-500 focus:ring-red-500`;
      return `${base} border-green-500 focus:border-green-500 focus:ring-green-500`;
    }

    if (fieldErrors[field]) return `${base} border-red-500 focus:border-red-500 focus:ring-red-500`;
    return `${base} border-green-500 focus:border-green-500 focus:ring-green-500`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar todos los campos obligatorios antes de enviar
    const allTouched: Partial<Record<RequiredField, boolean>> = {};
    const allErrors: Partial<Record<RequiredField, string>> = {};
    let hasErrors = false;

    for (const field of REQUIRED_FIELDS) {
      allTouched[field] = true;
      const msg = validateField(field, registerData[field], registerData.tipoDocumento, existingUsers);
      allErrors[field] = msg;
      if (msg) hasErrors = true;
    }

    setTouched(allTouched);
    setFieldErrors(allErrors);

    if (hasErrors) return;

    const passwordStrength = checkPasswordStrength(registerData.password);
    if (passwordStrength.score < 5) {
      setError('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }

    if (!imageFile) {
      setError('Debes adjuntar un comprobante o foto de tu documento de identidad para validar la mayoría de edad.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Subir la imagen
      let documentoUrl = '';
      try {
        setLoadingStep('Subiendo documento...');
        const uploadResult = await apiService.uploadImage(imageFile);
        documentoUrl = uploadResult.urlimagen;
      } catch (err) {
        console.error('Error uploading image', err);
        setError('Hubo un error al subir la imagen del documento.');
        setIsLoading(false);
        setLoadingStep('');
        return;
      }

      // 2. Registrar usuario (se creará inactivo)
      setLoadingStep('Creando tu cuenta...');
      const success = await register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        username: registerData.documento,
        email: registerData.email,
        password: registerData.password,
        role: 'Cliente',
        tipoDocumento: registerData.tipoDocumento,
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
      setLoadingStep('');
    }
  };

  // Helper para mostrar el mensaje de error bajo el campo
  const FieldError = ({ field }: { field: RequiredField }) =>
    touched[field] && fieldErrors[field] ? (
      <div className="text-[10px] text-red-400 mt-1 flex items-start gap-1 px-1 leading-tight">
        <span>•</span>
        <span>{fieldErrors[field]}</span>
      </div>
    ) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 text-center">
        <h2 className="text-xl text-white font-semibold mb-1">Crea tu cuenta</h2>
        <p className="text-sm text-gray-400">Ingresa tus datos para registrarte</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-4">
          {error && (
            <div style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 100%)', border: '1px solid rgba(239,68,68,0.6)', borderLeft: '3px solid #ef4444', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle style={{ color: '#ef4444', width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: '#f1f1f1', fontSize: '13px', fontWeight: '400', margin: 0, lineHeight: '1.5' }}>{error}</p>
            </div>
          )}

          {/* Fila 1: Nombres, Apellidos, Tipo Doc, Documento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-gray-300 text-xs font-medium">Nombres *</Label>
              <Input
                id="firstName"
                value={registerData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={inputClass('firstName')}
                placeholder="Tus nombres"
              />
              <FieldError field="firstName" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-gray-300 text-xs font-medium">Apellidos *</Label>
              <Input
                id="lastName"
                value={registerData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={inputClass('lastName')}
                placeholder="Tus apellidos"
              />
              <FieldError field="lastName" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tipoDocumento" className="text-gray-300 text-xs font-medium">Tipo Doc. *</Label>
              <Select
                value={registerData.tipoDocumento}
                onValueChange={handleTipoDocumentoChange}
              >
                <SelectTrigger
                  id="tipoDocumento"
                  className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                >
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white rounded-xl">
                  <SelectItem value="CC" className="text-sm text-white data-[highlighted]:bg-yellow-500/20 data-[highlighted]:text-yellow-400 cursor-pointer">CC - Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="TI" className="text-sm text-white data-[highlighted]:bg-yellow-500/20 data-[highlighted]:text-yellow-400 cursor-pointer">TI - Tarjeta de Identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="documento" className="text-gray-300 text-xs font-medium">N° Documento *</Label>
              <Input
                id="documento"
                value={registerData.documento}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !/^\d+$/.test(val)) {
                    toast.warning("No se permite texto, solo números en el documento");
                    return;
                  }
                  handleChange('documento', val);
                }}
                onBlur={() => handleBlur('documento')}
                className={inputClass('documento')}
                placeholder="Ej. 1000000000"
              />
              <FieldError field="documento" />
            </div>
          </div>

          {/* Fila 2: Email, Password, Fecha Nac */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300 text-xs font-medium">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={registerData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={inputClass('email')}
                placeholder="correo@ejemplo.com"
              />
              <FieldError field="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-300 text-xs font-medium">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`${inputClass('password')} pr-10`}
                  placeholder="Crea contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <FieldError field="password" />
              {registerData.password && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Fortaleza:</span>
                    <span className={`text-xs font-semibold ${checkPasswordStrength(registerData.password).score >= 4 ? 'text-green-400' :
                      checkPasswordStrength(registerData.password).score >= 3 ? 'text-blue-400' :
                        checkPasswordStrength(registerData.password).score >= 2 ? 'text-yellow-400' :
                          'text-red-400'
                      }`}>
                      {checkPasswordStrength(registerData.password).label}
                    </span>
                  </div>
                  <Progress
                    value={(checkPasswordStrength(registerData.password).score / 5) * 100}
                    className="h-1.5 bg-gray-800"
                    indicatorClassName={checkPasswordStrength(registerData.password).color}
                  />
                  {checkPasswordStrength(registerData.password).feedback.length > 0 && (
                    <div className="text-[11px] text-gray-400 mt-1">
                      <ul className="list-disc list-inside space-y-0.5">
                        {checkPasswordStrength(registerData.password).feedback.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fechaNacimiento" className="text-gray-300 text-xs font-medium">F. Nacimiento *</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={registerData.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                onBlur={() => handleBlur('fechaNacimiento')}
                className={inputClass('fechaNacimiento')}
                style={{ colorScheme: 'dark' }}
              />
              <FieldError field="fechaNacimiento" />
            </div>
          </div>

          {/* Fila 3: Telefono, Departamento, Ciudad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-gray-300 text-xs font-medium">Teléfono *</Label>
              <Input
                id="telefono"
                value={registerData.telefono}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !/^\d+$/.test(val)) {
                    toast.warning("No se permite texto, solo números en el teléfono");
                    return;
                  }
                  if (val.length > 10) {
                    toast.warning("El teléfono no puede tener más de 10 dígitos");
                    return;
                  }
                  handleChange('telefono', val);
                }}
                onBlur={() => handleBlur('telefono')}
                className={inputClass('telefono')}
                placeholder="Ej. 3001234567"
              />
              <FieldError field="telefono" />
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
                              setRegisterData(prev => ({ ...prev, departamento: dept.name, ciudad: '' }));
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
                              setRegisterData(prev => ({ ...prev, ciudad: city.name }));
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
                onChange={(e) => setRegisterData(prev => ({ ...prev, barrio: e.target.value }))}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Ej. Laureles"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="direccion" className="text-gray-300 text-xs font-medium">Dirección (Opcional)</Label>
              <Input
                id="direccion"
                value={registerData.direccion}
                onChange={(e) => setRegisterData(prev => ({ ...prev, direccion: e.target.value }))}
                className="bg-black/50 border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl h-9 text-sm transition-all"
                placeholder="Ej. Calle 10 #20-30"
              />
            </div>
          </div>

          {/* Fila 5: Comprobante */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-xs font-medium">
              Foto del Documento *
            </Label>
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-1">
              <span className="text-yellow-400 mt-0.5 shrink-0 text-sm">⚠</span>
              <p className="text-xs text-yellow-200 leading-relaxed">
                <span className="font-semibold text-yellow-400">Sube una foto de tu documento por ambos lados Es obligatorio para verificar tu mayoría de edad y activar la cuenta(preferible PDF).</span>. 
              </p>
            </div>
            {!imageFile ? (
              <div className="flex justify-center px-4 py-4 border border-dashed border-yellow-500/50 rounded-xl bg-white/5 hover:bg-white/10 hover:border-yellow-400 transition-all cursor-pointer">
                <label htmlFor="file-upload" className="flex items-center gap-3 cursor-pointer">
                  <Upload className="h-5 w-5 text-yellow-400 shrink-0" />
                  <span className="text-sm text-gray-200">
                    {' '}
                    <span className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
                      Haz clic para seleccionar archivo
                    </span>
                  </span>
                  <Input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/jpeg, image/png, application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                        if (!validTypes.includes(file.type)) {
                          toast.error("Solo se permiten archivos JPG, PNG o PDF");
                          e.target.value = '';
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("El archivo no puede pesar más de 5MB");
                          e.target.value = '';
                          return;
                        }
                        setImageFile(file);
                      } else {
                        setImageFile(null);
                      }
                    }}
                  />
                </label>
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
            className="flex-1 h-11 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all duration-300 disabled:opacity-80"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{loadingStep || 'Procesando...'}</span>
              </span>
            ) : (
              'Registrarse'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
