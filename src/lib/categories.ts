import type { IProduct } from '@/types';
import { categories } from '@/data/categories.json';

const record = Object.fromEntries(
  categories.map(({ key, label, emoji }) => [
    key,
    {
      label,
      emoji,
      slug: label.toLowerCase().replace(/\s+/g, '-'),
    },
  ]),
);

export function getCategories() {
  return Object.entries(record).map(([key, value]) => ({ ...value, key }));
}

export function getCategoryByKey(key: string) {
  return record[key];
}

/**
 * Get all unique categories from products
 */

export function getCategoryKeys() {
  return Object.keys(record);
}
