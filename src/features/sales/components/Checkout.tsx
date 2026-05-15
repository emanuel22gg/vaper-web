import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { MapPin, Home, CreditCard, Upload, CheckCircle, AlertTriangle, Trash2, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';
import { createVentaPedido, createDetalleVentaPedido, getProductoById, updateProducto, uploadImage, getDepartments, getCitiesByDepartment } from '@/shared/services/api';
import { VentaPedidoDto, DepartmentColombian, CityColombian } from '@/shared/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { cn } from "@/shared/ui/utils";

type CheckoutStep = 'pickup-choice' | 'shipping-address' | 'payment-method' | 'success';

interface ShippingAddress {
  direccion: string;
  departamento: string;
  municipio: string;
  barrio: string;
}

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSuccess }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('pickup-choice');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery' | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([
    {
      direccion: user?.direccion || '',
      departamento: user?.departamento || '',
      municipio: user?.ciudad || '',
      barrio: user?.barrio || ''
    }
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'in_store' | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);

  const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
  const [citiesMap, setCitiesMap] = useState<Record<string, CityColombian[]>>({});
  const [openDeptPopover, setOpenDeptPopover] = useState<boolean[]>([]);
  const [openCityPopover, setOpenCityPopover] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const depts = await getDepartments();
        setDepartments([...depts].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    fetchLocations();
  }, []);

  const fetchCitiesForDepartment = async (deptName: string) => {
    if (citiesMap[deptName]) return;
    try {
      const dept = departments.find(d => d.name === deptName);
      if (dept) {
        const data = await getCitiesByDepartment(dept.id);
        setCitiesMap(prev => ({
          ...prev,
          [deptName]: [...data].sort((a, b) => a.name.localeCompare(b.name))
        }));
      }
    } catch (err) {
      console.error("Error fetching cities", err);
    }
  };

  useEffect(() => {
    if (user) {
      setAddresses(prev => {
        const newAddresses = [...prev];
        if (newAddresses.length > 0) {
          if (!newAddresses[0].direccion && user.direccion) newAddresses[0].direccion = user.direccion;
          if (!newAddresses[0].departamento && user.departamento) {
            newAddresses[0].departamento = user.departamento;
            fetchCitiesForDepartment(user.departamento);
          }
          if (!newAddresses[0].municipio && user.ciudad) newAddresses[0].municipio = user.ciudad;
          if (!newAddresses[0].barrio && user.barrio) newAddresses[0].barrio = user.barrio;
        }
        return newAddresses;
      });
    }
  }, [user, departments]);

  // Paso 1: Selección de recogida o envío
  const handlePickupChoice = (choice: 'pickup' | 'delivery') => {
    setDeliveryType(choice);
    if (choice === 'pickup') {
      setStep('payment-method');
    } else {
      setStep('shipping-address');
    }
  };

  // Agregar nueva dirección
  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      { direccion: '', departamento: '', municipio: '', barrio: '' }
    ]);
  };

  // Eliminar dirección
  const handleRemoveAddress = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
  };

  // Actualizar dirección
  const handleAddressChange = (index: number, field: keyof ShippingAddress, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    
    if (field === 'departamento') {
      newAddresses[index].municipio = '';
      fetchCitiesForDepartment(value);
    }
    
    setAddresses(newAddresses);
  };

  // Ir a método de pago desde direcciones
  const handleContinueToPayment = () => {
    // Validar que la dirección a enviar (la última agregada) esté completa
    const activeAddress = addresses[addresses.length - 1];
    if (!activeAddress.direccion || !activeAddress.departamento || !activeAddress.municipio || !activeAddress.barrio) {
      toast.error('Por favor completa la información de la dirección');
      return;
    }
    setStep('payment-method');
  };

  // Seleccionar método de pago
  const handlePaymentMethodSelect = (method: 'cash' | 'transfer' | 'in_store') => {
    setPaymentMethod(method);
  };

  // Confirmar pedido
  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    if (!user) {
      toast.error('Debe iniciar sesión para procesar su pedido en el sistema.');
      return;
    }

    if (paymentMethod === 'transfer' && !comprobanteFile) {
      toast.error('Debe adjuntar el comprobante de pago para pedidos por transferencia.');
      return;
    }

    setIsSubmitting(true);
    try {
      let comprobanteUrl = '';
      if (paymentMethod === 'transfer' && comprobanteFile) {
        try {
          const uploadedImage = await uploadImage(comprobanteFile);
          comprobanteUrl = uploadedImage.urlimagen;
        } catch (error) {
          toast.error('Error al subir el comprobante. Intente nuevamente.');
          setIsSubmitting(false);
          return;
        }
      }

      // Create Order
      const activeAddress = deliveryType === 'delivery' ? addresses[addresses.length - 1] : null;

      const pedidoData: VentaPedidoDto = {
        usuarioId: parseInt(user.id),
        estadoId: 2, // 2 = Pendiente
        metodoPago: paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo', // Avoid invalid enumerations
        direccionEntrega: activeAddress ? `${activeAddress.direccion}, ${activeAddress.barrio}` : 'Recogida en tienda',
        ciudadEntrega: activeAddress ? activeAddress.municipio : 'N/A',
        departamentoEntrega: activeAddress ? activeAddress.departamento : 'N/A',
        observaciones: "",
        comprobanteUrl: comprobanteUrl || undefined,
        plazoAbonos: null,
        subtotal: getCartTotal(),
        envio: 0, // Assume 0 or logic to calculate
        total: getCartTotal(),
        vigenciaDevolucion: 1,
        tipoVenta: "Pedido",
        detalleVenta_Pedido: cart.map(item => ({
          productoId: parseInt(item.id),
          cantidad: item.quantity,
          precioUnitario: item.price,
          subtotal: item.price * item.quantity
        }))
      };

      const response = await createVentaPedido(pedidoData);
      const createdOrderId = response.id || response.Id || (response.data && response.data.id);

      if (!createdOrderId) {
        throw new Error("No se pudo obtener el ID del pedido");
      }

      // Save details & Update stock
      for (const cartItem of cart) {
        const prod = await getProductoById(parseInt(cartItem.id));

        await createDetalleVentaPedido({
          ventaPedidoId: createdOrderId,
          productoId: parseInt(cartItem.id),
          cantidad: cartItem.quantity,
          precioUnitario: cartItem.price,
          subtotal: cartItem.price * cartItem.quantity
        });

        if (prod) {
          await updateProducto(prod.id, {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity)
          });
        }
      }

      toast.success('¡Pedido creado con éxito!', {
        description: 'Recibirás una confirmación por correo electrónico',
      });

      setOrderTotal(getCartTotal());
      clearCart();
      setStep('success');

    } catch (error: any) {
      console.error('Error al guardar el pedido:', error);
      const serverDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      toast.error(`Error al procesar el pedido: ${serverDetails}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar paso actual
  const renderStep = () => {
    switch (step) {
      case 'pickup-choice':
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  ¿Desea recoger su pedido en nuestra tienda?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2">Dirección de la tienda:</h3>
                        <p className="text-muted-foreground">
                          Calle 52 # 51-12<br />
                          Local Comercial Remates de Boyacá<br />
                          Medellín, Boyacá
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handlePickupChoice('pickup')}
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Home className="w-8 h-8" />
                    <span>Sí, recogeré en tienda</span>
                  </Button>

                  <Button
                    onClick={() => handlePickupChoice('delivery')}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <MapPin className="w-8 h-8" />
                    <span>No, prefiero envío a domicilio</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={onBack} className="w-full">
                  Volver
                </Button>
              </CardFooter>
            </Card>
          </div>
        );

      case 'shipping-address':
        return (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {addresses.map((address, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg">
                        {index === 0 ? "Dirección Predeterminada (Registro)" : "Dirección Alterna"}
                      </CardTitle>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAddress(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`direccion-${index}`}>Dirección</Label>
                        <Input
                          id={`direccion-${index}`}
                          placeholder="Ej: Calle 123 # 45-67"
                          value={address.direccion}
                          onChange={(e) => handleAddressChange(index, 'direccion', e.target.value)}
                          readOnly={index === 0 && !!user?.direccion}
                          className={index === 0 && !!user?.direccion ? "bg-muted text-foreground font-medium cursor-not-allowed opacity-90" : ""}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`departamento-${index}`}>Departamento</Label>
                        {index === 0 && !!user?.departamento ? (
                           <Input
                             id={`departamento-${index}`}
                             value={address.departamento}
                             readOnly
                             className="bg-muted text-foreground font-medium cursor-not-allowed opacity-90"
                           />
                        ) : (
                          <Popover 
                            open={openDeptPopover[index] || false} 
                            onOpenChange={(open: boolean) => {
                              const newOpen = [...openDeptPopover];
                              newOpen[index] = open;
                              setOpenDeptPopover(newOpen);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openDeptPopover[index] || false}
                                className="w-full justify-between"
                              >
                                {address.departamento
                                  ? departments.find((dept) => dept.name === address.departamento)?.name
                                  : "Selecciona..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Buscar departamento..." />
                                <CommandList className="custom-scrollbar max-h-60">
                                  <CommandEmpty>No se encontró.</CommandEmpty>
                                  <CommandGroup>
                                    {departments.map((dept) => (
                                      <CommandItem
                                        key={dept.id}
                                        value={dept.name}
                                        onSelect={() => {
                                          handleAddressChange(index, 'departamento', dept.name);
                                          setOpenDeptPopover(prev => {
                                            const newOpen = [...prev];
                                            newOpen[index] = false;
                                            return newOpen;
                                          });
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            address.departamento === dept.name ? "opacity-100" : "opacity-0"
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
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`municipio-${index}`}>Municipio / Ciudad</Label>
                        {index === 0 && !!user?.ciudad ? (
                          <Input
                            id={`municipio-${index}`}
                            value={address.municipio}
                            readOnly
                            className="bg-muted text-foreground font-medium cursor-not-allowed opacity-90"
                          />
                        ) : (
                          <Popover 
                            open={openCityPopover[index] || false} 
                            onOpenChange={(open: boolean) => {
                              const newOpen = [...openCityPopover];
                              newOpen[index] = open;
                              setOpenCityPopover(newOpen);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCityPopover[index] || false}
                                disabled={!address.departamento}
                                className="w-full justify-between disabled:opacity-50"
                              >
                                {address.municipio
                                  ? citiesMap[address.departamento]?.find((city) => city.name === address.municipio)?.name
                                  : address.departamento ? "Selecciona..." : "Elige depto"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Buscar ciudad..." />
                                <CommandList className="custom-scrollbar max-h-60">
                                  <CommandEmpty>No se encontró.</CommandEmpty>
                                  <CommandGroup>
                                    {citiesMap[address.departamento]?.map((city) => (
                                      <CommandItem
                                        key={city.id}
                                        value={city.name}
                                        onSelect={() => {
                                          handleAddressChange(index, 'municipio', city.name);
                                          setOpenCityPopover(prev => {
                                            const newOpen = [...prev];
                                            newOpen[index] = false;
                                            return newOpen;
                                          });
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            address.municipio === city.name ? "opacity-100" : "opacity-0"
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
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`barrio-${index}`}>Barrio</Label>
                        <Input
                          id={`barrio-${index}`}
                          placeholder="Ej: El Poblado"
                          value={address.barrio}
                          onChange={(e) => handleAddressChange(index, 'barrio', e.target.value)}
                          readOnly={index === 0 && !!user?.barrio}
                          className={index === 0 && !!user?.barrio ? "bg-muted text-foreground font-medium cursor-not-allowed opacity-90" : ""}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {addresses.length < 2 && (
                  <Button
                    variant="outline"
                    onClick={handleAddAddress}
                    className="w-full"
                  >
                    Agregar dirección alterna
                  </Button>
                )}
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('pickup-choice')}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleContinueToPayment}
                  className="flex-1"
                >
                  Método de Pago
                </Button>
              </CardFooter>
            </Card>
          </div>
        );

      case 'payment-method':
        return (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {deliveryType === 'pickup'
                    ? 'Recogerás tu pedido en tienda'
                    : 'Envío a domicilio'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {deliveryType === 'pickup' ? (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
                      <p className="font-medium text-sm text-center text-black">
                        Como vas a recoger en tienda, puedes pagar allá mismo en efectivo o transferencia.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer transition-all ${paymentMethod === 'in_store'
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:bg-muted/50'
                          }`}
                        onClick={() => handlePaymentMethodSelect('in_store')}
                      >
                        <CardContent className="p-6 flex flex-col items-center gap-3">
                          <Home className="w-12 h-12 text-yellow-600" />
                          <h3 className="font-semibold text-center">Pagar al recoger</h3>
                          <p className="text-sm text-center text-muted-foreground">
                            Paga en efectivo o transferencia cuando llegues al local
                          </p>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${paymentMethod === 'transfer'
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:bg-muted/50'
                          }`}
                        onClick={() => handlePaymentMethodSelect('transfer')}
                      >
                        <CardContent className="p-6 flex flex-col items-center gap-3">
                          <CreditCard className="w-12 h-12 text-yellow-600" />
                          <h3 className="font-semibold text-center">Pagar de una vez</h3>
                          <p className="text-sm text-center text-muted-foreground">
                            Realiza la transferencia ahora y solo pasa a recogerlo
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${paymentMethod === 'cash'
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:bg-muted/50'
                        }`}
                      onClick={() => handlePaymentMethodSelect('cash')}
                    >
                      <CardContent className="p-6 flex flex-col items-center gap-3">
                        <CreditCard className="w-12 h-12 text-yellow-600" />
                        <h3 className="font-semibold">Contraentrega</h3>
                        <p className="text-sm text-center text-muted-foreground">
                          Paga en efectivo al recibir tu pedido en tu domicilio
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${paymentMethod === 'transfer'
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:bg-muted/50'
                        }`}
                      onClick={() => handlePaymentMethodSelect('transfer')}
                    >
                      <CardContent className="p-6 flex flex-col items-center gap-3">
                        <CreditCard className="w-12 h-12 text-yellow-600" />
                        <h3 className="font-semibold">Transferencia</h3>
                        <p className="text-sm text-center text-muted-foreground">
                          Paga por transferencia bancaria
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {(paymentMethod === 'transfer' || paymentMethod === 'cash') && deliveryType === 'delivery' && (
                  <div className="flex items-start gap-2 text-sm font-semibold text-yellow-600 bg-yellow-100 p-3 rounded-md mt-4 mb-4 border border-yellow-300">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                      El valor del envío no está incluido en el total del pedido, el cliente debe asumir el costo de envío
                    </p>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <>
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Información Bancaria</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Banco:</span>
                          <span className="font-semibold">Bancolombia</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo de cuenta:</span>
                          <span className="font-semibold">Ahorros</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Número de cuenta:</span>
                          <span className="font-semibold">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Titular:</span>
                          <span className="font-semibold">Remates de Boyacá</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Monto a transferir:</span>
                          <span className="font-bold text-lg">${getCartTotal().toLocaleString('es-CO')}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-3 items-center">
                        <Button
                          type="button"
                          className="w-full bg-[rgb(240,177,0,100)] text-[rgb(0,0,0)] hover:bg-gray-400"
                          onClick={() => document.getElementById('comprobante')?.click()}
                        >
                          {comprobanteFile ? 'Cambiar comprobante' : 'Subir comprobante de pago'}
                        </Button>
                        <Input
                          id="comprobante"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("El comprobante no puede pesar más de 5MB");
                                e.target.value = '';
                                return;
                              }
                              setComprobanteFile(file);
                            }
                          }}
                        />
                        {comprobanteFile && (
                          <p className="text-sm text-green-600 mt-1">
                            Archivo seleccionado: {comprobanteFile.name}
                          </p>
                        )}
                      </CardFooter>
                    </Card>
                  </>)}
                {/* Resumen del pedido */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total a pagar:</span>
                      <span>${getCartTotal().toLocaleString('es-CO')}</span>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => deliveryType === 'pickup' ? setStep('pickup-choice') : setStep('shipping-address')}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  disabled={!paymentMethod || isSubmitting}
                  className="flex-1 bg-[rgb(240,177,0,100)] text-[rgb(0,0,0)] hover:bg-gray-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        );

      case 'success':
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">¡Pedido Creado con Éxito!</h2>
                <p className="text-muted-foreground mb-8">
                  Gracias por tu compra. Recibirás un correo de confirmación pronto.
                </p>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {paymentMethod === 'cash' || paymentMethod === 'in_store' ? 'Total por pagar' : 'Total pagado'}
                    </p>
                    <p className="text-2xl font-bold">${orderTotal.toLocaleString('es-CO')}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Método de entrega</p>
                    <p className="font-semibold">
                      {deliveryType === 'pickup' ? 'Recogida en tienda' : 'Envío a domicilio'}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Método de pago</p>
                    <p className="font-semibold">
                      {paymentMethod === 'cash' ? 'Contraentrega' : (paymentMethod === 'in_store' ? 'Pago en Tienda' : 'Transferencia bancaria')}
                    </p>
                  </div>
                  {deliveryType === 'delivery' && addresses.length > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Dirección de envío</p>
                      <p className="font-semibold">
                        {addresses[addresses.length - 1].direccion}, {addresses[addresses.length - 1].barrio}
                        <br />
                        {addresses[addresses.length - 1].municipio}, {addresses[addresses.length - 1].departamento}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={onSuccess}
                  className="w-full mt-8 bg-[rgb(255,221,0)] text-[rgb(0,0,0)] hover:bg-gray-400"
                >
                  Volver a la tienda
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
        {renderStep()}
      </div>
    </div>
  );
};
