import React, { useState, useEffect } from "react";
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
import { getCompras, createCompra, updateCompra, getProductos, getProveedores } from "../services/api";
import { CompraDto, DetalleCompraDto, Producto, Proveedor } from "../types";
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
      (filterStatus === "Anulado" && orden.estado === 0);
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
      case 0:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (estado: number) => {
    switch (estado) {
      case 1:
        return <CheckCircle className="h-4 w-4" />;
      case 0:
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
          estado: 0,
          observaciones: `${ordenToAnular.observaciones || ""}\nAnulada: ${razonAnulacion}`.trim()
        });
        toast.success("Orden de compra anulada exitosamente");
        fetchData();
        setIsAnularDialogOpen(false);
        setOrdenToAnular(null);
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
      const proveedor = proveedores.find(p => p.id === orden.proveedorId);

      doc.setFontSize(20);
      doc.text("ORDEN DE COMPRA", 105, 20, { align: "center" });

      doc.setFontSize(14);
      doc.text("Información de la Orden", 20, 40);

      doc.setFontSize(10);
      doc.text(`Número de Orden: ${orden.numeroCompra || "N/A"}`, 20, 50);
      doc.text(`Proveedor: ${proveedor?.nombreCompletoORazonSocial || "N/A"}`, 20, 60);
      doc.text(
        `Fecha: ${new Date(orden.fechaCompra || "").toLocaleDateString("es-ES")}`,
        20,
        70,
      );
      doc.text(
        `Estado: ${orden.estado === 0 ? "Anulada" : "Activa"}`,
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
      orden.detalleCompras?.forEach((detalle, index) => {
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

        const productoInfo = productos.find(p => p.id === detalle.productoId);
        const nombreProducto = productoInfo?.nombreProducto || "Producto";
        const codigoProducto = String(detalle.productoId);

        doc.text(codigoProducto, 20, yPosition);

        // Truncar nombre si es muy largo
        const nombreTruncado =
          nombreProducto.length > 25
            ? nombreProducto.substring(0, 25) + "..."
            : nombreProducto;
        doc.text(nombreTruncado, 45, yPosition);

        doc.text(detalle.cantidad.toString(), 120, yPosition);
        doc.text(
          `$${detalle.precioUnitario.toLocaleString()}`,
          140,
          yPosition,
        );
        doc.text(
          `$${detalle.subtotal.toLocaleString()}`,
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
      doc.save(`Orden_Compra_${orden.numeroCompra}.pdf`);

      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al exportar PDF");
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
        fechaCompra: new Date().toISOString(),
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
      toast.success("Orden de compra creada exitosamente");
      fetchData(); // Recargar datos de la API
      setNewOrden({
        proveedorId: 0,
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
    setShowSearchDropdown(index);

    if (value.trim()) {
      const filtered = productos.filter((prod) => {
        const searchLower = value.toLowerCase();
        return (
          prod.nombreProducto.toLowerCase().includes(searchLower) ||
          String(prod.id).toLowerCase().includes(searchLower)
        );
      });
      setSearchResults(filtered);
    } else {
      setSearchResults(productos);
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
                          {proveedores.map(p => (
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
                                      setSearchResults(productos);
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
                              : orden.estado === 0
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-gray-500 text-white border-gray-500"
                          }
                        >
                          {orden.estado === 0 ? "Anulada" : "Activa"}
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
                          {orden.estado !== 0 && (
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
                      <div className="text-right">
                        <p className="font-medium">
                          {detalle.cantidad} × $
                          {detalle.precioUnitario.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          $
                          {detalle.subtotal.toLocaleString()}
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
