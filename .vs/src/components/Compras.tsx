import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Separator } from "./ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { toast } from "sonner";
import { productosInventario } from "../data/productos";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Truck,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  DollarSign,
  FileText,
  AlertTriangle,
  Download,
} from "lucide-react";

interface ProductoOrden {
  id: string;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  codigo: string;
}

interface OrdenCompra {
  id: string;
  numeroOrden: string;
  proveedor: string;
  fechaOrden: Date;
  fechaEntrega: Date;
  estado: "Activo" | "Anulado";
  productos: ProductoOrden[];
  total: number;
  razonAnulacion?: string;
}

const mockOrdenes: OrdenCompra[] = [
  {
    id: "1",
    numeroOrden: "OC-2024-001",
    proveedor: "VapeMax Distribuciones",
    fechaOrden: new Date("2024-03-01"),
    fechaEntrega: new Date("2024-03-05"),
    estado: "Activo",
    productos: [
      {
        id: "1",
        nombre: "Vape Desechable 2000 puffs",
        cantidad: 50,
        precioCompra: 25000,
        precioVenta: 30000,
        codigo: "VD-001",
      },
      {
        id: "2",
        nombre: "Líquido Frutal 30ml",
        cantidad: 30,
        precioCompra: 35000,
        precioVenta: 40000,
        codigo: "LQ-001",
      },
    ],
    total: 2300000, // 50*25000 + 30*35000
  },
  {
    id: "2",
    numeroOrden: "OC-2024-002",
    proveedor: "Smoke Solutions SAS",
    fechaOrden: new Date("2024-03-10"),
    fechaEntrega: new Date("2024-03-15"),
    estado: "Activo",
    productos: [
      {
        id: "5",
        nombre: "Mod Premium 80W",
        cantidad: 10,
        precioCompra: 150000,
        precioVenta: 180000,
        codigo: "MOD-001",
      },
      {
        id: "10",
        nombre: "Batería 18650",
        cantidad: 20,
        precioCompra: 45000,
        precioVenta: 50000,
        codigo: "ACC-003",
      },
    ],
    total: 2400000, // 10*150000 + 20*45000
  },
  {
    id: "3",
    numeroOrden: "OC-2024-003",
    proveedor: "Premium Vapes Ltd",
    fechaOrden: new Date("2024-03-15"),
    fechaEntrega: new Date("2024-03-20"),
    estado: "Activo",
    productos: [
      {
        id: "3",
        nombre: "Pod System Premium",
        cantidad: 25,
        precioCompra: 80000,
        precioVenta: 90000,
        codigo: "POD-001",
      },
      {
        id: "2",
        nombre: "Líquido Premium 60ml",
        cantidad: 40,
        precioCompra: 55000,
        precioVenta: 60000,
        codigo: "LQ-001",
      },
    ],
    total: 4200000, // 25*80000 + 40*55000
  },
  {
    id: "4",
    numeroOrden: "OC-2024-004",
    proveedor: "VapeMax Distribuciones",
    fechaOrden: new Date("2024-03-20"),
    fechaEntrega: new Date("2024-03-25"),
    estado: "Activo",
    productos: [
      {
        id: "7",
        nombre: "Vape Desechable Crystal Pro 6000",
        cantidad: 30,
        precioCompra: 38000,
        precioVenta: 45000,
        codigo: "VD-002",
      },
    ],
    total: 1140000, // 30*38000
  },
  {
    id: "5",
    numeroOrden: "OC-2024-005",
    proveedor: "Import Vapes Colombia",
    fechaOrden: new Date("2024-03-22"),
    fechaEntrega: new Date("2024-03-28"),
    estado: "Activo",
    productos: [
      {
        id: "6",
        nombre: "Tanque Sub-Ohm",
        cantidad: 15,
        precioCompra: 80000,
        precioVenta: 90000,
        codigo: "ACC-002",
      },
      {
        id: "9",
        nombre: "Cartuchos Rellenables (Pack x3)",
        cantidad: 25,
        precioCompra: 28000,
        precioVenta: 30000,
        codigo: "POD-002",
      },
    ],
    total: 1900000, // 15*80000 + 25*28000
  },
  {
    id: "6",
    numeroOrden: "OC-2024-006",
    proveedor: "Distribuidora Nacional",
    fechaOrden: new Date("2024-03-25"),
    fechaEntrega: new Date("2024-03-30"),
    estado: "Anulado",
    productos: [
      {
        id: "8",
        nombre: "Líquido Menthol Ice 30ml",
        cantidad: 50,
        precioCompra: 42000,
        precioVenta: 50000,
        codigo: "LQ-002",
      },
    ],
    total: 2100000, // 50*42000
    razonAnulacion: "Falta de pago",
  },
  {
    id: "7",
    numeroOrden: "OC-2024-007",
    proveedor: "Premium Vapes Ltd",
    fechaOrden: new Date("2024-03-28"),
    fechaEntrega: new Date("2024-04-02"),
    estado: "Activo",
    productos: [
      {
        id: "4",
        nombre: "Resistencias Pod (Pack x5)",
        cantidad: 40,
        precioCompra: 35000,
        precioVenta: 40000,
        codigo: "ACC-001",
      },
      {
        id: "10",
        nombre: "Cargador USB-C Universal",
        cantidad: 100,
        precioCompra: 15000,
        precioVenta: 18000,
        codigo: "ACC-003",
      },
    ],
    total: 2900000, // 40*35000 + 100*15000
  },
];

export const Compras: React.FC = () => {
  const [ordenes, setOrdenes] =
    useState<OrdenCompra[]>(mockOrdenes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] =
    useState(false);
  const [selectedOrden, setSelectedOrden] =
    useState<OrdenCompra | null>(null);
  
  // Estados para el diálogo de anular compra
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [ordenToAnular, setOrdenToAnular] = useState<OrdenCompra | null>(null);
  const [razonAnulacion, setRazonAnulacion] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para crear nueva orden
  const [newOrden, setNewOrden] = useState({
    proveedor: "",
    productos: [
      {
        id: "",
        nombre: "",
        cantidad: 0,
        precioCompra: 0,
        precioVenta: 0,
        codigo: "",
      },
    ],
  });

  // Estado para búsqueda de productos en la orden
  const [productoSearchTerm, setProductoSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<number | null>(null);

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      orden.numeroOrden
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      orden.proveedor
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || orden.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Cálculos para paginación
  const totalPages = Math.ceil(
    filteredOrdenes.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrdenes = filteredOrdenes.slice(
    startIndex,
    endIndex,
  );

  // Resetear página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-green-500";
      case "Anulado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <CheckCircle className="h-4 w-4" />;
      case "Anulado":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewOrden = (orden: OrdenCompra) => {
    setSelectedOrden(orden);
    setIsViewDialogOpen(true);
  };

  const openAnularDialog = (orden: OrdenCompra) => {
    setOrdenToAnular(orden);
    setRazonAnulacion(""); // Limpiar el campo cuando se abre el diálogo
    setIsAnularDialogOpen(true);
  };

  const handleAnularOrden = () => {
    if (ordenToAnular && razonAnulacion.trim()) {
      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === ordenToAnular.id
            ? { ...o, estado: "Anulado" as const, razonAnulacion }
            : o,
        ),
      );
      setIsAnularDialogOpen(false);
      setOrdenToAnular(null);
      setRazonAnulacion("");
      toast.success("Orden de compra anulada exitosamente");
    } else if (!razonAnulacion.trim()) {
      toast.error("Por favor ingresa una razón de anulación");
    }
  };

  const exportToPDF = async (orden: OrdenCompra) => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Configurar el documento
      doc.setFontSize(20);
      doc.text("ORDEN DE COMPRA", 105, 20, { align: "center" });

      // Información básica de la orden
      doc.setFontSize(14);
      doc.text("Información de la Orden", 20, 40);

      doc.setFontSize(10);
      doc.text(`Número de Orden: ${orden.numeroOrden}`, 20, 50);
      doc.text(`Proveedor: ${orden.proveedor}`, 20, 60);
      doc.text(
        `Fecha de Entrega: ${orden.fechaEntrega.toLocaleDateString("es-ES")}`,
        20,
        70,
      );
      doc.text(
        `Estado: ${orden.estado === "Anulado" ? "Anulada" : orden.estado}`,
        20,
        80,
      );

      // Línea separadora
      doc.line(20, 95, 190, 95);

      // Productos
      doc.setFontSize(14);
      doc.text("Productos Solicitados", 20, 110);

      // Encabezados de tabla
      doc.setFontSize(9);
      doc.text("Código", 20, 125);
      doc.text("Producto", 45, 125);
      doc.text("Cant.", 120, 125);
      doc.text("Precio Unit.", 140, 125);
      doc.text("Subtotal", 170, 125);

      // Línea de encabezado
      doc.line(20, 127, 190, 127);

      // Datos de productos
      let yPosition = 135;
      orden.productos.forEach((producto, index) => {
        if (yPosition > 250) {
          // Nueva página si es necesario
          doc.addPage();
          yPosition = 30;
          doc.setFontSize(9);
          doc.text("Código", 20, yPosition);
          doc.text("Producto", 45, yPosition);
          doc.text("Cant.", 120, yPosition);
          doc.text("Precio Unit.", 140, yPosition);
          doc.text("Subtotal", 170, yPosition);
          doc.line(20, yPosition + 2, 190, yPosition + 2);
          yPosition += 10;
        }

        doc.text(producto.codigo, 20, yPosition);

        // Truncar nombre si es muy largo
        const nombreTruncado =
          producto.nombre.length > 25
            ? producto.nombre.substring(0, 25) + "..."
            : producto.nombre;
        doc.text(nombreTruncado, 45, yPosition);

        doc.text(producto.cantidad.toString(), 120, yPosition);
        doc.text(
          `$${producto.precioCompra.toLocaleString()}`,
          140,
          yPosition,
        );
        doc.text(
          `$${(producto.cantidad * producto.precioCompra).toLocaleString()}`,
          170,
          yPosition,
        );

        yPosition += 8;
      });

      // Totales
      yPosition += 10;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      // Total en negrita
      doc.setFontSize(12);
      doc.text(
        `TOTAL: $${orden.total.toLocaleString()}`,
        140,
        yPosition,
      );

      // Información adicional
      yPosition += 20;
      doc.setFontSize(8);
      doc.text(
        `Documento generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
        20,
        yPosition,
      );

      // Pie de página
      const pageHeight = doc.internal.pageSize.height;
      doc.text(
        "Sistema de Gestión Empresarial - VapeStore",
        105,
        pageHeight - 15,
        { align: "center" },
      );

      // Descargar el PDF
      doc.save(`Orden_Compra_${orden.numeroOrden}.pdf`);

      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al exportar PDF");
    }
  };

  const handleCreateOrden = () => {
    const productosValidos = newOrden.productos.filter(
      (p) => p.id && p.cantidad > 0 && p.precioCompra > 0,
    );

    if (
      !newOrden.proveedor ||
      productosValidos.length === 0
    ) {
      toast.error(
        "Por favor complete todos los campos requeridos",
      );
      return;
    }

    const total = productosValidos.reduce(
      (sum, p) => sum + p.cantidad * p.precioCompra,
      0,
    );

    const nuevaOrden: OrdenCompra = {
      id: (ordenes.length + 1).toString(),
      numeroOrden: `OC-2024-${String(ordenes.length + 1).padStart(3, "0")}`,
      proveedor: newOrden.proveedor,
      fechaOrden: new Date(),
      fechaEntrega: new Date(),
      estado: "Activo",
      productos: productosValidos,
      total,
    };

    setOrdenes((prev) => [...prev, nuevaOrden]);
    setNewOrden({
      proveedor: "",
      productos: [
        {
          id: "",
          nombre: "",
          cantidad: 0,
          precioCompra: 0,
          precioVenta: 0,
          codigo: "",
        },
      ],
    });
    setIsCreateDialogOpen(false);
    toast.success("Orden de compra creada exitosamente");
  };

  const addProducto = () => {
    setNewOrden((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          id: "",
          nombre: "",
          cantidad: 0,
          precioCompra: 0,
          precioVenta: 0,
          codigo: "",
        },
      ],
    }));
  };

  const handleProductoSelect = (
    index: number,
    productoId: string,
  ) => {
    const producto = productosInventario.find(
      (p) => p.id === productoId,
    );
    if (producto) {
      setNewOrden((prev) => ({
        ...prev,
        productos: prev.productos.map((p, i) =>
          i === index
            ? {
                id: producto.id,
                nombre: producto.nombre,
                cantidad: p.cantidad || 1,
                precioCompra: producto.precio,
                precioVenta: producto.precio * 1.2, // Precio de venta 20% más que el de compra
                codigo: producto.codigo,
              }
            : p,
        ),
      }));
      setShowSearchDropdown(null); // Cerrar el dropdown después de seleccionar
      setProductoSearchTerm(""); // Limpiar búsqueda
    }
  };

  const handleSearchChange = (index: number, value: string) => {
    setProductoSearchTerm(value);
    setShowSearchDropdown(index);
    
    if (value.trim()) {
      const filtered = productosInventario.filter((prod) => {
        const searchLower = value.toLowerCase();
        return (
          prod.nombre.toLowerCase().includes(searchLower) ||
          prod.codigo.toLowerCase().includes(searchLower)
        );
      });
      setSearchResults(filtered);
    } else {
      setSearchResults(productosInventario);
    }
  };

  const updateProducto = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setNewOrden((prev) => ({
      ...prev,
      productos: prev.productos.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const removeProducto = (index: number) => {
    setNewOrden((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const total = newOrden.productos.reduce(
      (sum, p) => sum + p.cantidad * p.precioCompra,
      0,
    );
    return { total };
  };

  const { total } = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Compras</CardTitle>
              <CardDescription>
                Administra las órdenes de compra a tus
                proveedores
              </CardDescription>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[rgb(21,93,252)] hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                    Nueva Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Crear Nueva Orden de Compra
                  </DialogTitle>
                  <DialogDescription>
                    Completa la información para crear una nueva
                    orden de compra.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="proveedor">
                        Proveedor
                      </Label>
                      <Select
                        value={newOrden.proveedor}
                        onValueChange={(value) =>
                          setNewOrden({
                            ...newOrden,
                            proveedor: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VapeMax Distribuciones">
                            VapeMax Distribuciones
                          </SelectItem>
                          <SelectItem value="Smoke Solutions SAS">
                            Smoke Solutions SAS
                          </SelectItem>
                          <SelectItem value="Premium Vapes Ltd">
                            Premium Vapes Ltd
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaIngreso">
                        Fecha Ingreso
                      </Label>
                      <Input
                        id="fechaIngreso"
                        type="text"
                        value={new Date().toLocaleDateString('es-CO')}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Productos</Label>
                    <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                      {newOrden.productos.map(
                        (producto, index) => (
                          <div
                            key={index}
                            className="space-y-2"
                          >
                            <div className="grid grid-cols-6 gap-2 items-end">
                              <div className="col-span-2 relative">
                                <Label className="text-xs">
                                  Buscar Producto
                                </Label>
                                <div className="relative">
                                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                                  <Input
                                    placeholder="Buscar por nombre o código..."
                                    value={showSearchDropdown === index ? productoSearchTerm : producto.nombre || ""}
                                    onChange={(e) => handleSearchChange(index, e.target.value)}
                                    onFocus={() => {
                                      setShowSearchDropdown(index);
                                      setSearchResults(productosInventario);
                                    }}
                                    className="pl-8 h-9"
                                  />
                                </div>
                                {showSearchDropdown === index && searchResults.length > 0 && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                                    {searchResults.map((prod) => (
                                      <div
                                        key={prod.id}
                                        onClick={() => handleProductoSelect(index, prod.id)}
                                        className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium text-sm">
                                            {prod.nombre}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {prod.codigo} - Stock: {prod.stock} - ${prod.precio.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {showSearchDropdown === index && searchResults.length === 0 && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg p-4 z-50">
                                    <p className="text-sm text-muted-foreground text-center">
                                      No se encontraron productos
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Cantidad
                                </Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  min="1"
                                  value={
                                    producto.cantidad || ""
                                  }
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "cantidad",
                                      parseInt(
                                        e.target.value,
                                      ) || 0,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Precio Compra
                                </Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  value={producto.precioCompra || ""}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "precioCompra",
                                      parseInt(
                                        e.target.value,
                                      ) || 0,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Precio Venta
                                </Label>
                                <Input
                                  placeholder="0"
                                  type="number"
                                  value={producto.precioVenta || ""}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "precioVenta",
                                      parseInt(
                                        e.target.value,
                                      ) || 0,
                                    )
                                  }
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeProducto(index)
                                }
                                disabled={
                                  newOrden.productos.length ===
                                  1
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {producto.id && (
                              null
                            )}
                          </div>
                        ),
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addProducto}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Producto
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">
                        Total:{" "}
                      </span>
                      <span className="font-semibold text-lg">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateOrden}
                    disabled={
                      !newOrden.proveedor ||
                      newOrden.productos.every((p) => !p.id)
                    }
                    
                  >
                    Crear Orden
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar órdenes por número o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Todos los estados
                </SelectItem>
                <SelectItem value="Activo">
                  Activos
                </SelectItem>
                <SelectItem value="Anulado">
                  Anuladas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrdenes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {filteredOrdenes.length === 0
                            ? "No se encontraron órdenes de compra"
                            : "No hay órdenes en esta página"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrdenes.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell>
                        {orden.proveedor}
                      </TableCell>
                      <TableCell>
                        {orden.fechaEntrega.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          ${orden.total.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            orden.estado === "Activo"
                              ? "bg-black text-white border-black"
                              : orden.estado === "Anulado"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-gray-500 text-white border-gray-500"
                          }
                        >
                          {orden.estado === "Anulado" ? "Anulada" : orden.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewOrden(orden)
                            }
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToPDF(orden)}
                            title="Exportar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {orden.estado !== "Anulado" && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Anular orden"
                              onClick={() => openAnularDialog(orden)}
                            >
                              <XCircle className="text-red-600 hover:text-red-700 hover:bg-red-50" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {filteredOrdenes.length > itemsPerPage && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.max(prev - 1, 1),
                      )
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages),
                      )
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              Información completa de la orden de compra
            </DialogDescription>
          </DialogHeader>

          {selectedOrden && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Número de Orden
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrden.numeroOrden}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Proveedor
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrden.proveedor}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Fecha de Entrega
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrden.fechaEntrega.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Estado
                  </Label>
                  <Badge
                    className={`${getStatusColor(selectedOrden.estado)} mt-1`}
                  >
                    {getStatusIcon(selectedOrden.estado)}
                    <span className="ml-1">
                      {selectedOrden.estado === "Anulado"
                        ? "Anulada"
                        : selectedOrden.estado}
                    </span>
                  </Badge>
                </div>
              </div>

              {selectedOrden.estado === "Anulado" && selectedOrden.razonAnulacion && (
                <>
                  <Separator />
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Label className="text-sm font-medium text-red-800">
                      Razón de Anulación
                    </Label>
                    <p className="text-sm text-red-700 mt-2">
                      {selectedOrden.razonAnulacion}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Productos
                </Label>
                <div className="space-y-2">
                  {selectedOrden.productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {producto.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {producto.codigo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {producto.cantidad} × $
                          {producto.precioCompra.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          $
                          {(
                            producto.cantidad * producto.precioCompra
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>
                    ${selectedOrden.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Anular Compra */}
      <AlertDialog open={isAnularDialogOpen} onOpenChange={setIsAnularDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg">
                  Anular Orden de Compra
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <AlertDialogDescription className="text-base">
              ¿Estás seguro de que deseas anular esta orden de compra? El estado cambiará a "Anulado".
            </AlertDialogDescription>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  <strong>Orden:</strong> {ordenToAnular?.numeroOrden}
                </span>
              </div>
              {ordenToAnular && (
                <div className="mt-2 ml-6 text-sm text-orange-700">
                  <div>Proveedor: {ordenToAnular.proveedor}</div>
                  <div>Total: ${ordenToAnular.total.toLocaleString()}</div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Label className="text-sm font-medium">Razón de Anulación</Label>
              <Textarea
                value={razonAnulacion}
                onChange={(e) => setRazonAnulacion(e.target.value)}
                placeholder="Escribe la razón para anular la orden"
                className="w-full h-20"
              />
            </div>
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAnularOrden}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              Anular Orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
