# Plan de Implementación: Selección de Imágenes Existentes

## Objetivo
Permitir al usuario seleccionar una imagen existente de la galería (API) al crear o editar una categoría, además de la opción actual de subir una nueva imagen. Hacer que la imagen sea opcional.

## Cambios Propuestos

### 1. Servicios API (`src/services/api.ts`)
- Agregar función `getAllImages()` para obtener el listado de todas las imágenes disponibles (`GET /api/Imagenes`).

### 2. Nuevo Componente: Selector de Imágenes (`src/components/shared/ImageSelector.tsx`)
- Crear un componente reutilizable que tenga dos pestañas/modos:
    - **Subir Nueva**: La funcionalidad actual (Input type file).
    - **Galería**: Una cuadrícula (grid) mostrando las imágenes obtenidas de la API.
- Permitir seleccionar una imagen de la galería.
- Permitir limpiar la selección (imagen opcional).

### 3. Actualizar Diálogos
- **`CreateCategoriaDialog.tsx`**:
    - Reemplazar el input de archivo simple con el nuevo `ImageSelector`.
    - Lógica: Si se selecciona una imagen existente, usar su ID. Si se sube una nueva, subirla primero y usar el nuevo ID.
- **`EditCategoriaDialog.tsx`**:
    - Similar a la creación, integrar `ImageSelector`.
    - Pre-seleccionar la imagen actual si existe.

## Verificación
- Abrir modal de crear categoría.
- Verificar que se puede subir imagen nueva (flujo anterior).
- Verificar que se puede seleccionar una imagen existente de la lista.
- Verificar que se puede guardar sin imagen.
- Repetir para edición.
