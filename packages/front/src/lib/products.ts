import { productSchema } from '@/schemas';
import type { IProduct } from '../types';
import logger from '@/utils/logger';

/**
 *  Validate json
 */
function parseProduct(raw: any, fallbackId: string): IProduct {
  if (!raw.id) raw.id = fallbackId;
  const product = productSchema.parse(raw);
  logger.debug({ productId: product.id }, 'Product parsed successfully');
  return product;
}

/**
 * Dynamically loads all product JSON files from src/data/
 */
export async function loadAllProducts({
  withVIP,
}: {
  /**
   * Load all products included VIP products
   */
  withVIP?: boolean;
} = {}): Promise<IProduct[]> {
  logger.info({ withVIP }, 'Loading all products');

  // Import all JSON files from src/data/ eagerly
  const dataModules = import.meta.glob<{ default: any }>(
    '/src/data/products/*.json',
    {
      eager: true,
    },
  );

  const products: IProduct[] = [];
  const filePaths = Object.keys(dataModules);
  logger.debug({ totalFiles: filePaths.length }, 'Product JSON files found');

  for (const path in dataModules) {
    const module = dataModules[path];
    const rawItem = module.default;

    const fileId =
      path
        .split('/')
        .pop()
        ?.replace(/\.json$/, '') || path;

    try {
      const product = parseProduct(rawItem, fileId);
      if (withVIP || !product.vip) {
        products.push(product);
      }
    } catch (error) {
      logger.error(
        { path, error: error instanceof Error ? error.message : String(error) },
        'Failed to parse product',
      );
    }
  }

  logger.info(
    { totalProducts: products.length, withVIP },
    'Products loaded successfully',
  );
  return products;
}
