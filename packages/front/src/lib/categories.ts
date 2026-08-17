import { categories } from '@/data/categories.json';
import logger from '@/utils/logger';

const record = Object.fromEntries(
  categories.map(({ key, label, emoji }) => [
    key,
    {
      key,
      label,
      emoji,
      slug: label.toLowerCase().replace(/\s+/g, '-'),
    },
  ]),
);

export function getCategories() {
  const result = Object.entries(record).map(([key, value]) => ({
    ...value,
    key,
  }));
  logger.debug({ categoryCount: result.length }, 'Categories retrieved');
  return result;
}

export function getCategoryByKey(key: string) {
  const result = record[key];
  if (result) {
    logger.debug({ key }, 'Category retrieved by key');
  } else {
    logger.warn({ key }, 'Category not found by key');
  }
  return result;
}

/**
 * Get all unique categories from products
 */
export function getCategoryKeys() {
  const keys = Object.keys(record);
  logger.debug({ categoryKeyCount: keys.length }, 'Category keys retrieved');
  return keys;
}
