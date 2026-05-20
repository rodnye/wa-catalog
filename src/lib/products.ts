import type { Product } from '../types';

/**
 * Dynamically loads all product JSON files from src/data/
 * Uses Vite's import.meta.glob for truly dynamic loading.
 *
 * To add new products: simply add a new JSON file to src/data/
 * No code changes needed — it will be automatically picked up.
 */
export async function loadAllProducts(): Promise<Product[]> {
  // Import all JSON files from src/data/ eagerly
  const dataModules = import.meta.glob<{ default: any[] }>('/src/data/*.json', {
    eager: true,
  });

  const products: Product[] = [];

  for (const path in dataModules) {
    const module = dataModules[path];
    const data = module.default;

    // Each JSON file contains an array of products
    if (Array.isArray(data)) {
      for (const item of data) {
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
    }
  }

  return products;
}

/**
 * Get all unique categories from products
 */
export function getCategories(products: Product[]): string[] {
  return [...new Set(products.flatMap((p) => p.categorias))].sort();
}
