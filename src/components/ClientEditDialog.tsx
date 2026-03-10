import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "./ui/command";
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { UsuarioDto, DepartmentColombian, CityColombian } from '../types';
import { updateUsuario, getDepartments, getCitiesByDepartment, getUsuarios } from '../services/api';

interface ClientEditDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: UsuarioDto | null;
    onSuccess: () => void;
}

export const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
    isOpen,
    onOpenChange,
    cliente,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [editingCliente, setEditingCliente] = useState<UsuarioDto | null>(null);
    const [allClientes, setAllClientes] = useState<UsuarioDto[]>([]);

    // Estados para Geografía
    const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
    const [cities, setCities] = useState<CityColombian[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [isEditDeptPopoverOpen, setIsEditDeptPopoverOpen] = useState(false);
    const [isEditCityPopoverOpen, setIsEditCityPopoverOpen] = useState(false);
    const [editNumDocError, setEditNumDocError] = useState<string | null>(null);

    // Estados para Dirección Estructurada
    const [editAddrParts, setEditAddrParts] = useState({
        tipoVia: '',
        viaPrincipal: '',
        viaSecundaria: '',
        placa: ''
    });

    const tiposVia = ['Calle', 'Carrera', 'Transversal', 'Diagonal', 'Circular', 'Avenida', 'Pasaje'];

    useEffect(() => {
        if (isOpen && cliente) {
            setEditingCliente({ ...cliente });
            fetchInitialData();

            // Intentar parsear la dirección si cumple el formato estándar
            const addrRegex = /^([A-Za-z]+)\s+([0-9]+)\s+#\s+([0-9]+)-([0-9]+)$/;
            const match = (cliente.direccion || '').match(addrRegex);
            if (match) {
                setEditAddrParts({
                    tipoVia: match[1],
                    viaPrincipal: match[2],
                    viaSecundaria: match[3],
                    placa: match[4]
                });
            } else {
                setEditAddrParts({ tipoVia: '', viaPrincipal: '', viaSecundaria: '', placa: '' });
            }
        }
    }, [isOpen, cliente]);

    const fetchInitialData = async () => {
        try {
            const [depts, users] = await Promise.all([
                getDepartments(),
                getUsuarios()
            ]);
            setDepartments([...depts].sort((a, b) => a.name.localeCompare(b.name)));
            setAllClientes(users);
        } catch (error) {
            console.error("Error loading initial data for ClientEdit:", error);
        }
    };

    useEffect(() => {
        if (selectedDepartment) {
            const fetchCities = async () => {
                try {
                    const dept = departments.find(d => d.name === selectedDepartment);
                    if (dept) {
                        const data = await getCitiesByDepartment(dept.id);
                        setCities([...data].sort((a, b) => a.name.localeCompare(b.name)));
                    }
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };
            fetchCities();
        }
    }, [selectedDepartment, departments]);

    // Efecto para concatenar dirección
    useEffect(() => {
        const { tipoVia, viaPrincipal, viaSecundaria, placa } = editAddrParts;
        if (tipoVia && viaPrincipal && viaSecundaria && placa) {
            const fullAddr = `${tipoVia} ${viaPrincipal} # ${viaSecundaria}-${placa}`;
            setEditingCliente(prev => prev ? ({ ...prev, direccion: fullAddr }) : null);
        }
    }, [editAddrParts]);

    // Validación de documento en tiempo real
    useEffect(() => {
        const doc = editingCliente?.numeroDocumento?.trim();
        if (doc && doc.length > 3 && editingCliente && cliente) {
            const exists = allClientes.some(c => c.numeroDocumento === doc && c.id !== cliente.id);
            setEditNumDocError(exists ? `⚠️ Esta cédula ya pertenece a otro cliente.` : null);
        } else {
            setEditNumDocError(null);
        }
    }, [editingCliente?.numeroDocumento, allClientes, cliente]);

    const validate = (data: Partial<UsuarioDto>): boolean => {
        const { nombres, apellidos, correo, telefono, numeroDocumento, fechaNacimiento, ciudad, direccion } = data;

        if (!nombres || !apellidos || !correo || !telefono || !numeroDocumento || !ciudad || !direccion) {
            toast.error("Por favor, complete todos los campos obligatorios (*)");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo!)) {
            toast.error("El formato del correo electrónico no es válido");
            return false;
        }

        if (fechaNacimiento) {
            const birthDate = new Date(fechaNacimiento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            if (age < 18) {
                toast.error("El cliente debe ser mayor de 18 años");
                return false;
            }
        }

        if (editNumDocError) {
            toast.error("Corrija el número de documento duplicado");
            return false;
        }

        return true;
    };

    const handleUpdate = async () => {
        if (editingCliente && cliente) {
            if (!validate(editingCliente)) return;

            try {
                setLoading(true);
                const dataToUpdate = {
                    ...editingCliente,
                    username: editingCliente.numeroDocumento,
                    contraseña: editingCliente.contraseña || editingCliente.numeroDocumento
                };
                await updateUsuario(cliente.id, dataToUpdate as UsuarioDto);
                toast.success('Cliente actualizado correctamente.');
                onSuccess();
                onOpenChange(false);
            } catch (error) {
                console.error("Error updating user:", error);
                toast.error("Error al actualizar el cliente");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                        Modifica la información del cliente seleccionado.
                    </DialogDescription>
                </DialogHeader>

                {editingCliente && (
                    <Tabs defaultValue="basic" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Básico</TabsTrigger>
                            <TabsTrigger value="contact">Contacto</TabsTrigger>
                            <TabsTrigger value="commercial">Comercial</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nombre">Nombres *</Label>
                                    <Input
                                        id="edit-nombre"
                                        value={editingCliente.nombres || ''}
                                        onChange={(e) => setEditingCliente({ ...editingCliente, nombres: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-apellido">Apellidos *</Label>
                                    <Input
                                        id="edit-apellido"
                                        value={editingCliente.apellidos || ''}
                                        onChange={(e) => setEditingCliente({ ...editingCliente, apellidos: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-tipoDocumento">Tipo Documento</Label>
                                    <Select
                                        value={editingCliente.tipoDocumento || 'CC'}
                                        onValueChange={(value: string) => setEditingCliente({ ...editingCliente, tipoDocumento: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CC">Cédula</SelectItem>
                                            <SelectItem value="CE">Cédula Extranjería</SelectItem>
                                            <SelectItem value="NIT">NIT</SelectItem>
                                            <SelectItem value="PP">Pasaporte</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="edit-numeroDocumento">Número Documento *</Label>
                                    <Input
                                        id="edit-numeroDocumento"
                                        value={editingCliente.numeroDocumento || ''}
                                        onChange={(e) => setEditingCliente({ ...editingCliente, numeroDocumento: e.target.value })}
                                        className={cn(editNumDocError ? "border-red-500 focus-visible:ring-red-500" : "")}
                                    />
                                    {editNumDocError && (
                                        <p className="text-[10px] font-bold text-red-600 bg-red-50 p-1 rounded border border-red-100 animate-in fade-in slide-in-from-top-1">
                                            {editNumDocError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-fechaNacimiento">Fecha Nacimiento</Label>
                                    <Input
                                        id="edit-fechaNacimiento"
                                        type="date"
                                        value={editingCliente.fechaNacimiento || ''}
                                        onChange={(e) => setEditingCliente({ ...editingCliente, fechaNacimiento: e.target.value })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact" className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email *</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editingCliente.correo || ''}
                                        onChange={(e) => setEditingCliente({ ...editingCliente, correo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-telefono">Teléfono *</Label>
                                    <Input
                                        id="edit-telefono"
                                        value={editingCliente.telefono || ''}
                                        onChange={(e) => setEditingCliente({ ...editingCliente, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Departamento *</Label>
                                    <Popover open={isEditDeptPopoverOpen} onOpenChange={setIsEditDeptPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isEditDeptPopoverOpen}
                                                className="w-full justify-between"
                                            >
                                                {selectedDepartment
                                                    ? departments.find((dept) => dept.name === selectedDepartment)?.name
                                                    : "Seleccionar Departamento"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar departamento..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                                                    <CommandGroup>
                                                        {departments.map((dept) => (
                                                            <CommandItem
                                                                key={dept.id}
                                                                value={dept.name}
                                                                onSelect={() => {
                                                                    setSelectedDepartment(dept.name);
                                                                    setIsEditDeptPopoverOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedDepartment === dept.name ? "opacity-100" : "opacity-0"
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
                                <div className="space-y-2">
                                    <Label>Ciudad *</Label>
                                    <Popover open={isEditCityPopoverOpen} onOpenChange={setIsEditCityPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isEditCityPopoverOpen}
                                                className="w-full justify-between"
                                                disabled={!selectedDepartment}
                                            >
                                                {editingCliente.ciudad
                                                    ? cities.find((city) => city.name === editingCliente.ciudad)?.name
                                                    : "Seleccionar Ciudad"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar ciudad..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                                                    <CommandGroup>
                                                        {cities.map((city) => (
                                                            <CommandItem
                                                                key={city.id}
                                                                value={city.name}
                                                                onSelect={() => {
                                                                    setEditingCliente({ ...editingCliente, ciudad: city.name });
                                                                    setIsEditCityPopoverOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        editingCliente.ciudad === city.name ? "opacity-100" : "opacity-0"
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

                            <div className="space-y-2">
                                <Label htmlFor="edit-barrio">Barrio</Label>
                                <Input
                                    id="edit-barrio"
                                    value={editingCliente.barrio || ''}
                                    onChange={(e) => setEditingCliente({ ...editingCliente, barrio: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-blue-600 font-semibold">Dirección Estructural *</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tipo Vía</Label>
                                        <Select
                                            value={editAddrParts.tipoVia}
                                            onValueChange={(val: string) => setEditAddrParts({ ...editAddrParts, tipoVia: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tiposVia.map(tipo => (
                                                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">N° Principal</Label>
                                        <Input
                                            placeholder="67"
                                            value={editAddrParts.viaPrincipal}
                                            onChange={(e) => setEditAddrParts({ ...editAddrParts, viaPrincipal: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">N° Secundario</Label>
                                        <div className="flex items-center">
                                            <span className="mr-1 text-gray-500">#</span>
                                            <Input
                                                placeholder="102"
                                                value={editAddrParts.viaSecundaria}
                                                onChange={(e) => setEditAddrParts({ ...editAddrParts, viaSecundaria: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">N° Placa</Label>
                                        <div className="flex items-center">
                                            <span className="mr-1 text-gray-500">-</span>
                                            <Input
                                                placeholder="25"
                                                value={editAddrParts.placa}
                                                onChange={(e) => setEditAddrParts({ ...editAddrParts, placa: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded border text-sm italic text-gray-600">
                                    Vista previa: {editingCliente.direccion || 'Ingrese los campos de dirección'}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="commercial" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-tipo">Tipo Cliente *</Label>
                                <Select
                                    value={editingCliente.tipoCliente || 'Minorista'}
                                    onValueChange={(val: 'Minorista' | 'Mayorista') => setEditingCliente({ ...editingCliente, tipoCliente: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Minorista">Minorista</SelectItem>
                                        <SelectItem value="Mayorista">Mayorista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" onClick={handleUpdate} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Actualizar Cliente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
