import { productSchema } from '@/schemas';
import type { IProduct } from '../types';
import { getCategoryByKey } from './categories';

/**
 *  Validate json
 */
function parseProduct(raw: any, fallbackId: string): IProduct {
  if (!raw.id) raw.id = fallbackId;
  return productSchema.parse(raw);
}

/**
 * Dynamically loads all product JSON files from src/data/
 */
export async function loadAllProducts(): Promise<IProduct[]> {
  // Import all JSON files from src/data/ eagerly
  const dataModules = import.meta.glob<{ default: any }>(
    '/src/data/products/*.json',
    {
      eager: true,
    },
  );

  const products: IProduct[] = [];

  for (const path in dataModules) {
    const module = dataModules[path];
    const rawItem = module.default;

    const fileId =
      path
        .split('/')
        .pop()
        ?.replace(/\.json$/, '') || path;

    const product = parseProduct(rawItem, fileId);
    products.push(product);
  }

  return products;
}
