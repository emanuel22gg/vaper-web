# Conexión Web API - Plataforma E-Commerce

Este es el repositorio oficial para el front-end de la tienda en línea de **Conexión Web**, especializada en la venta al por mayor y detal de vaporizadores y productos asociados.

El proyecto está diseñado bajo una excelente separación de intereses basada en "Feature Slicing", asegurando la escalabilidad del lado del cliente.

## 🚀 Tecnologías Principales
- **React 18** (gestionado por *Vite* para un arranque local ultra-rápido)
- **TypeScript** para una programación declarativa segura contra errores.
- **Tailwind CSS** permitiendo una estilización moderna, minimalista y responsiva (Mobile First).
- **Lucide React** para la iconografía gráfica y limpia.
- **Shadcn UI** en la construcción de diálogos, cuadros y alertas visuales.

---

## 📦 Instalación y Uso Local

Asegúrate de contar con Node.js en tu equipo. 

1. Sitúate en la raíz del proyecto e instala las dependencias de Node:
   ```bash
   npm install
   ```
2. Arranca el servidor local de desarrollo (por defecto en el puerto 5173 o aledaño):
   ```bash
   npm run dev
   ```
3. Ahora puedes abrir tu navegador en `http://localhost:5173/` para ver la aplicación web.

---

## 🏗️ Estructura del Proyecto (`src/`)

El modelo modular del proyecto previene dependencias cíclicas aglutinando la lógica por concepto:
- **/features**: Áreas exclusivas del sistema (ej. `auth/`, `admin/`, `products/`, `clients/`, `sales/`, `public/`).
- **/shared**: Componentes UI universales y herramientas globales, como la lógica del estado (ej. `useCart.tsx`) y los consumidores de red (ej. `api.ts`).

## 💾 Despliegue (Build)

Para mandar el proyecto a producción (Nginx, Vercel, Netlify, IIS, etc), emplea el comando:
```bash
npm run build
```
Esto compactará y minificará todo el código TSX en una carpeta limpia de archivos listos para el cliente.

> **Nota de Archivo**: Originalmente importado bajo un diseño exportado de *Figma*, la base del código fue refactorizada magistralmente para habilitar APIs de back-end fluidas, eliminar "mocks" de prueba, estabilizar componentes asíncronos limpios e integrar rutas funcionales para la gestión de productos y catálogos dinámicos.