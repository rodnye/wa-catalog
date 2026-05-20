import type { Product } from '../types';

/**
 * Dynamically loads all product JSON files from src/data/
 */
export async function loadAllProducts(): Promise<Product[]> {
  // Import all JSON files from src/data/ eagerly
  const dataModules = import.meta.glob<{ default: any }>('/src/data/products/*.json', {
    eager: true,
  });

  const products: Product[] = [];

  for (const path in dataModules) {
    const module = dataModules[path];
    const item = module.default;

    products.push({
      id: item.id || path,
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      precio: typeof item.precio === 'number' ? item.precio : 0,
      moneda: item.moneda || 'CUP',
      imagenes: Array.isArray(item.imagenes) ? item.imagenes : [],
      categorias: Array.isArray(item.categorias) ? item.categorias : [],
      destacado: item.destacado === true,
      disponible: item.disponible !== false,
    });
  }

  return products;
}

/**
 * Get all unique categories from products
 */
export function getCategories(products: Product[]): string[] {
  return [...new Set(products.flatMap((p) => p.categorias))].sort();
}
