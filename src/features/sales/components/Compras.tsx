import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
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
} from "@/shared/ui/alert-dialog";
import { Separator } from "@/shared/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import { toast } from "sonner";
import { getCompras, createCompra, updateCompra, getProductos, getProveedores, updateProducto } from "@/shared/services/api";
import { CompraDto, DetalleCompraDto, Producto, Proveedor } from "@/shared/types";
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
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';



export const Compras: React.FC = () => {
  const [ordenes, setOrdenes] = useState<CompraDto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] =
    useState(false);
  const [selectedOrden, setSelectedOrden] =
    useState<CompraDto | null>(null);

  // Estados para el diálogo de anular compra
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [ordenToAnular, setOrdenToAnular] = useState<CompraDto | null>(null);
  const [razonAnulacion, setRazonAnulacion] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para crear nueva orden
  const [newOrden, setNewOrden] = useState({
    proveedorId: 0,
    numeroFactura: "",
    fechaFactura: "",
    productos: [
      {
        id: 0,
        nombre: "",
        cantidad: 0,
        precioCompra: 0,
        precioVenta: 0,
        codigo: "",
      },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [comprasData, productosData, proveedoresData] = await Promise.all([
        getCompras(),
        getProductos(),
        getProveedores()
      ]);
      setOrdenes(comprasData);
      setProductos(productosData);
      setProveedores(proveedoresData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos de la API");
    } finally {
      setLoading(false);
    }
  };

  // Estado para búsqueda de productos en la orden
  const [productoSearchTerm, setProductoSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<number | null>(null);

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      (orden.numeroCompra || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (proveedores.find(p => p.id === orden.proveedorId)?.nombreCompletoORazonSocial || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "Activo" && orden.estado === 1) ||
      (filterStatus === "Anulado" && orden.estado === 3);
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

  const getStatusColor = (estado: number) => {
    switch (estado) {
      case 1:
        return "bg-green-500";
      case 3:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (estado: number) => {
    switch (estado) {
      case 1:
        return <CheckCircle className="h-4 w-4" />;
      case 3:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewOrden = (orden: CompraDto) => {
    setSelectedOrden(orden);
    setIsViewDialogOpen(true);
  };

  const openAnularDialog = (orden: CompraDto) => {
    setOrdenToAnular(orden);
    setRazonAnulacion(""); // Limpiar el campo cuando se abre el diálogo
    setIsAnularDialogOpen(true);
  };

  const handleAnularOrden = async () => {
    if (ordenToAnular && razonAnulacion.trim()) {
      try {
        await updateCompra(ordenToAnular.id!, {
          ...ordenToAnular,
          estado: 3,
          observaciones: `${ordenToAnular.observaciones || ""}\nAnulada: ${razonAnulacion}`.trim()
        });

        // Revertir stock de productos (restar lo que se había sumado al comprar)
        if (ordenToAnular.detalleCompras) {
          for (const detalle of ordenToAnular.detalleCompras) {
            const productoOriginal = productos.find(p => p.id === detalle.productoId);
            if (productoOriginal) {
              await updateProducto(productoOriginal.id, {
                id: productoOriginal.id,
                nombreProducto: productoOriginal.nombreProducto,
                precio: productoOriginal.precio,
                stock: Math.max(0, productoOriginal.stock - detalle.cantidad),
                categoriaId: productoOriginal.categoriaId,
                descripcion: productoOriginal.descripcion,
                idImagen: productoOriginal.idImagen,
                estado: productoOriginal.estado
              });
            }
          }
        }

        toast.success("Orden de compra anulada y stock revertido");
        fetchData();
        setRazonAnulacion("");
      } catch (error) {
        console.error("Error anular compra:", error);
        toast.error("Error al anular la compra en la API");
      }
    } else if (!razonAnulacion.trim()) {
      toast.error("Por favor ingresa una razón de anulación");
    }
  };

  const exportToPDF = async (orden: CompraDto) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-CO');
      };

      const proveedor = proveedores.find(p => p.id === orden.proveedorId);

      // Header - Logo y Título
      try {
        if (logoImage) {
          doc.addImage(logoImage, 'PNG', pageWidth / 2 - 25, y, 50, 20);
          y += 25;
        }
      } catch (e) {
        console.warn("Could not load logo image for PDF", e);
        y += 10;
      }

      doc.setFontSize(22);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "bold");
      doc.text("Vaper One", pageWidth / 2, y, { align: "center" });
      y += 10;
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("ORDEN DE COMPRA", pageWidth / 2, y, { align: "center" });
      y += 8;

      doc.setFontSize(10);
      doc.text("NIT: 830.517.246-3", pageWidth / 2, y, { align: "center" });
      y += 5;
      doc.text("Teléfono: +57 (4) 123-4567", pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setDrawColor(33, 33, 33);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Info Section
      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);

      // Columna Izquierda: Datos del Proveedor
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL PROVEEDOR", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Proveedor: ${proveedor?.nombreCompletoORazonSocial || "N/A"}`, margin, y);
      y += 6;
      doc.text(`Teléfono: ${proveedor?.telefono || "N/A"}`, margin, y);

      // Columna Derecha: Datos de la Orden
      let yDerecha = y - 13;
      doc.setFont("helvetica", "bold");
      doc.text("INFO COMPRA", pageWidth - margin - 50, yDerecha);
      yDerecha += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Número: ${orden.numeroCompra || "N/A"}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Fecha: ${formatDate(orden.fechaCompra || "")}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Estado: ${orden.estado === 3 ? "ANULADA" : "ACTIVA"}`, pageWidth - margin - 50, yDerecha);

      y = Math.max(y, yDerecha) + 15;

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Código", margin + 5, y + 7);
      doc.text("Producto", margin + 30, y + 7);
      doc.text("Cant", margin + 100, y + 7);
      doc.text("Precio", margin + 120, y + 7);
      doc.text("Subtotal", margin + 150, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      // Table Content
      orden.detalleCompras?.forEach((detalle) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        const productoInfo = productos.find(p => p.id === detalle.productoId);
        const nombreProducto = productoInfo?.nombreProducto || "Producto";
        
        doc.text(String(detalle.productoId), margin + 5, y + 7);
        doc.text(nombreProducto.substring(0, 45), margin + 30, y + 7);
        doc.text(String(detalle.cantidad), margin + 100, y + 7);
        doc.text(`$${detalle.precioUnitario.toLocaleString()}`, margin + 120, y + 7);
        doc.text(`$${detalle.subtotal.toLocaleString()}`, margin + 150, y + 7);
        y += 8;
      });

      y += 5;
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Totals
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("TOTAL:", margin + 120, y);
      doc.text(`$${orden.total.toLocaleString()}`, margin + 150, y);

      y += 30;
      // Signatures
      if (y > 250) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(10);
      doc.line(margin, y, margin + 60, y);
      doc.text("Autorizado por", margin, y + 5);

      doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
      doc.text("Firma Proveedor", pageWidth - margin - 60, y + 5);

      y += 30;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado el ${formatDate(new Date())} a las ${new Date().toLocaleTimeString("es-ES")}`, pageWidth / 2, y, { align: "center" });
      doc.text("Vaper One - Sistema de Gestión de Compras", pageWidth / 2, y + 4, { align: "center" });

      doc.save(`Orden_Compra_${orden.numeroCompra}.pdf`);

      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  const handleCreateOrden = async () => {
    const productosValidos = newOrden.productos.filter(
      (p) => p.id && p.cantidad > 0 && p.precioCompra > 0,
    );

    if (
      !newOrden.proveedorId ||
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

    const subtotal = total; // Si la API requiere subtotal separado

    try {
      const nuevaCompra: CompraDto = {
        numeroCompra: `COM-${Date.now()}`, // Generar número único requerido por el backend
        numeroFactura: newOrden.numeroFactura || undefined,
        fechaCompra: new Date().toISOString(),
        fechaRegistro: newOrden.fechaFactura ? new Date(newOrden.fechaFactura).toISOString() : undefined,
        proveedorId: newOrden.proveedorId,
        subtotal: subtotal,
        total: total,
        estado: 1, // Activo por defecto
        observaciones: "Creado desde la Web",
        detalleCompras: productosValidos.map(p => ({
          productoId: p.id as number,
          cantidad: p.cantidad,
          precioUnitario: p.precioCompra,
          subtotal: p.cantidad * p.precioCompra
        }))
      };

      await createCompra(nuevaCompra);

      // Actualizar stock de productos (sumar cantidades compradas)
      for (const p of productosValidos) {
        const productoOriginal = productos.find(prod => prod.id === p.id);
        if (productoOriginal) {
          await updateProducto(productoOriginal.id, {
            id: productoOriginal.id,
            nombreProducto: productoOriginal.nombreProducto,
            precio: productoOriginal.precio,
            stock: productoOriginal.stock + p.cantidad,
            categoriaId: productoOriginal.categoriaId,
            descripcion: productoOriginal.descripcion,
            idImagen: productoOriginal.idImagen,
            estado: productoOriginal.estado
          });
        }
      }

      toast.success("Orden de compra creada y stock actualizado");
      fetchData(); // Recargar datos de la API (incluyendo el nuevo stock)
      setNewOrden({
        proveedorId: 0,
        numeroFactura: "",
        fechaFactura: "",
        productos: [
          {
            id: 0,
            nombre: "",
            cantidad: 0,
            precioCompra: 0,
            precioVenta: 0,
            codigo: "",
          },
        ],
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error al crear compra:", error);
      toast.error("Error al crear la compra en la API");
    }
  };

  const addProducto = () => {
    setNewOrden((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          id: 0,
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
    productoId: number,
  ) => {
    const producto = productos.find(
      (p) => p.id === productoId,
    );
    if (producto) {
      setNewOrden((prev) => ({
        ...prev,
        productos: prev.productos.map((p, i) =>
          i === index
            ? {
              id: producto.id,
              nombre: producto.nombreProducto,
              cantidad: p.cantidad || 1,
              precioCompra: producto.precio,
              precioVenta: producto.precio * 1.2, // Precio de venta 20% más que el de compra
              codigo: String(producto.id), // O usar un campo codigo si existe en Producto
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

    if (value.trim()) {
      setShowSearchDropdown(index);
      const filtered = productos.filter((prod) => {
        const searchLower = value.toLowerCase();
        return (
          prod.nombreProducto.toLowerCase().includes(searchLower) ||
          String(prod.id).toLowerCase().includes(searchLower)
        );
      });
      setSearchResults(filtered);
    } else {
      setShowSearchDropdown(null);
      setSearchResults([]);
    }
  };

  const updateFormProducto = (
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
                        value={String(newOrden.proveedorId)}
                        onValueChange={(value: string) =>
                          setNewOrden({
                            ...newOrden,
                            proveedorId: Number(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {proveedores.filter(p => p.estado).map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nombreCompletoORazonSocial}
                            </SelectItem>
                          ))}
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="numeroFactura">
                        Número de Factura
                      </Label>
                      <Input
                        id="numeroFactura"
                        type="text"
                        placeholder="Ej: FAC-2024-001"
                        value={newOrden.numeroFactura}
                        onChange={(e) =>
                          setNewOrden({ ...newOrden, numeroFactura: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaFactura">
                        Fecha Facturada
                      </Label>
                      <Input
                        id="fechaFactura"
                        type="date"
                        value={newOrden.fechaFactura}
                        onChange={(e) =>
                          setNewOrden({ ...newOrden, fechaFactura: e.target.value })
                        }
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
                                      if (productoSearchTerm.trim()) {
                                        setShowSearchDropdown(index);
                                      }
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
                                            {prod.nombreProducto}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            ID: {prod.id} - Stock: {prod.stock}
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
                                    updateFormProducto(
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
                                    updateFormProducto(
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
                                    updateFormProducto(
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
                      !newOrden.proveedorId ||
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
                  <TableHead className="w-[120px]">N° Orden</TableHead>
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
                      colSpan={6}
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
                      <TableCell className="font-medium text-xs">
                        {orden.numeroCompra || "N/A"}
                      </TableCell>
                      <TableCell>
                        {proveedores.find(p => p.id === orden.proveedorId)?.nombreCompletoORazonSocial || "Cargando..."}
                      </TableCell>
                      <TableCell>
                        {new Date(orden.fechaCompra || "").toLocaleDateString()}
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
                            orden.estado === 1
                              ? "bg-black text-white border-black"
                              : orden.estado === 3
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-gray-500 text-white border-gray-500"
                          }
                        >
                          {orden.estado === 3 ? "Anulada" : "Activa"}
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
                          {orden.estado !== 3 && (
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
                    size="default"
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
                      size="default"
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
                    size="default"
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
                    {selectedOrden.numeroCompra || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Proveedor
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {proveedores.find(p => p.id === selectedOrden.proveedorId)?.nombreCompletoORazonSocial || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Fecha de Compra
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedOrden.fechaCompra).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Estado
                  </Label>
                  <Badge
                    className={`${getStatusColor(selectedOrden.estado)} mt-1 text-white`}
                  >
                    {getStatusIcon(selectedOrden.estado)}
                    <span className="ml-1">
                      {selectedOrden.estado === 0
                        ? "Anulada"
                        : "Activa"}
                    </span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    N° Factura
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrden.numeroFactura || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Fecha Facturada
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrden.fechaRegistro
                      ? new Date(selectedOrden.fechaRegistro).toLocaleDateString('es-CO')
                      : "—"}
                  </p>
                </div>
              </div>

              {selectedOrden.estado === 0 && selectedOrden.observaciones && (
                <>
                  <Separator />
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Label className="text-sm font-medium text-red-800">
                      Observaciones / Razón de Anulación
                    </Label>
                    <p className="text-sm text-red-700 mt-2">
                      {selectedOrden.observaciones}
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
                  {selectedOrden.detalleCompras?.map((detalle, idx) => (
                    <div
                      key={detalle.id || idx}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {productos.find(p => p.id === detalle.productoId)?.nombreProducto || "Producto"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {detalle.productoId}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>Cantidad: {detalle.cantidad}</span>
                          <span>Precio Unit: ${detalle.precioUnitario.toLocaleString()}</span>
                        </div>
                        <p className="font-semibold text-sm">
                          Subtotal: ${detalle.subtotal.toLocaleString()}
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
                  <strong>Orden:</strong> {ordenToAnular?.numeroCompra || "N/A"}
                </span>
              </div>
              {ordenToAnular && (
                <div className="mt-2 ml-6 text-sm text-orange-700">
                  <div>Proveedor: {proveedores.find(p => p.id === ordenToAnular.proveedorId)?.nombreCompletoORazonSocial || "N/A"}</div>
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
    </div >
  );
};
