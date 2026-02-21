import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Home, CreditCard, Upload, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

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
  const [step, setStep] = useState<CheckoutStep>('pickup-choice');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery' | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([
    { direccion: '', departamento: '', municipio: '', barrio: '' }
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | null>(null);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);

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

  // Actualizar dirección
  const handleAddressChange = (index: number, field: keyof ShippingAddress, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  // Ir a método de pago desde direcciones
  const handleContinueToPayment = () => {
    // Validar que al menos la primera dirección esté completa
    const firstAddress = addresses[0];
    if (!firstAddress.direccion || !firstAddress.departamento || !firstAddress.municipio || !firstAddress.barrio) {
      toast.error('Por favor completa al menos la primera dirección');
      return;
    }
    setStep('payment-method');
  };

  // Seleccionar método de pago
  const handlePaymentMethodSelect = (method: 'cash' | 'transfer') => {
    setPaymentMethod(method);
  };

  // Manejar archivo de comprobante
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfPayment(e.target.files[0]);
      toast.success('Comprobante cargado exitosamente');
    }
  };

  // Confirmar pedido
  const handleConfirmOrder = () => {
    if (paymentMethod === 'transfer' && !proofOfPayment) {
      toast.error('Debes subir el comprobante de pago para continuar');
      return;
    }

    // Aquí se procesaría el pedido
    toast.success('¡Pedido creado con éxito!', {
      description: 'Recibirás una confirmación por correo electrónico',
    });
    
    clearCart();
    setStep('success');
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
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Dirección {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`direccion-${index}`}>Dirección</Label>
                        <Input
                          id={`direccion-${index}`}
                          placeholder="Ej: Calle 123 # 45-67"
                          value={address.direccion}
                          onChange={(e) => handleAddressChange(index, 'direccion', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`departamento-${index}`}>Departamento</Label>
                        <Input
                          id={`departamento-${index}`}
                          placeholder="Ej: Antioquia"
                          value={address.departamento}
                          onChange={(e) => handleAddressChange(index, 'departamento', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`municipio-${index}`}>Municipio</Label>
                        <Input
                          id={`municipio-${index}`}
                          placeholder="Ej: Medellín"
                          value={address.municipio}
                          onChange={(e) => handleAddressChange(index, 'municipio', e.target.value)}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`barrio-${index}`}>Barrio</Label>
                        <Input
                          id={`barrio-${index}`}
                          placeholder="Ej: El Poblado"
                          value={address.barrio}
                          onChange={(e) => handleAddressChange(index, 'barrio', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={handleAddAddress}
                  className="w-full"
                >
                  Agregar otra dirección
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePaymentMethodSelect('cash')}
                  >
                    <CardContent className="p-6 flex flex-col items-center gap-3">
                      <CreditCard className="w-12 h-12" />
                      <h3 className="font-semibold">Efectivo</h3>
                      <p className="text-sm text-center text-muted-foreground">
                        Paga en efectivo {deliveryType === 'pickup' ? 'en tienda' : 'al recibir tu pedido'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      paymentMethod === 'transfer'
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePaymentMethodSelect('transfer')}
                  >
                    <CardContent className="p-6 flex flex-col items-center gap-3">
                      <CreditCard className="w-12 h-12" />
                      <h3 className="font-semibold">Transferencia</h3>
                      <p className="text-sm text-center text-muted-foreground">
                        Paga por transferencia bancaria
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {paymentMethod === 'transfer' && (
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
                    <CardFooter className="flex flex-col gap-3">
                      <div className="w-full">
                        <Label htmlFor="proof-upload">Comprobante de Pago *</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            id="proof-upload"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('proof-upload')?.click()}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {proofOfPayment ? proofOfPayment.name : 'Subir comprobante'}
                          </Button>
                        </div>
                        {proofOfPayment && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ Comprobante cargado
                          </p>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                )}

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
                  disabled={!paymentMethod || (paymentMethod === 'transfer' && !proofOfPayment)}
                  className="flex-1 bg-[rgb(240,177,0,100)] text-[rgb(0,0,0)] hover:bg-gray-400"
                >
                  Confirmar Pedido
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
                    <p className="text-sm text-muted-foreground">Total pagado</p>
                    <p className="text-2xl font-bold">${getCartTotal().toLocaleString('es-CO')}</p>
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
                      {paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia bancaria'}
                    </p>
                  </div>
                  {deliveryType === 'delivery' && addresses[0]?.direccion && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Dirección de envío</p>
                      <p className="font-semibold">
                        {addresses[0].direccion}, {addresses[0].barrio}
                        <br />
                        {addresses[0].municipio}, {addresses[0].departamento}
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
