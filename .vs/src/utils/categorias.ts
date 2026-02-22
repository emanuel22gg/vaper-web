import { Categoria } from '../types';

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const filtrarCategorias = (
  categorias: Categoria[],
  searchTerm: string,
  filtroEstado: string
): Categoria[] => {
  let categoriasFiltradas = [...categorias];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    categoriasFiltradas = categoriasFiltradas.filter(categoria =>
      (categoria.id?.toString() || '').includes(term) ||
      (categoria.nombreCategoria?.toLowerCase() || '').includes(term) ||
      (categoria.descripcion?.toLowerCase() || '').includes(term)
    );
  }

  if (filtroEstado !== 'todas') {
    const estadoBol = filtroEstado === 'activas';
    categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.estado === estadoBol);
  }

  return categoriasFiltradas;
};
