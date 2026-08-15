import { atom } from 'nanostores';
import type { IProduct } from '@/types';
import {
  listDirectory,
  getFileContent,
  updateFile,
  getGateway,
  getCommitAuthor,
} from '@/lib/gateway';
import type { FileEntry } from '@rodny/decap-gateway';
import logger from '@/utils/logger';

/* ── helpers ─────────────────────────────────────────── */

export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/* ── categories (read / write categories.json) ───────── */

export interface ICategory {
  label: string;
  key: string;
  emoji: string;
}

export async function loadCategoriesFromRepo(): Promise<ICategory[]> {
  logger.info('Loading categories from repository');
  try {
    const raw = await getFileContent('src/data/categories.json');
    const data = JSON.parse(raw);
    const categories = data.categories ?? [];
    logger.info(
      { categoryCount: categories.length },
      'Categories loaded successfully',
    );
    return categories;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to load categories',
    );
    throw error;
  }
}

export async function saveCategoriesToRepo(
  categories: ICategory[],
): Promise<void> {
  logger.info(
    { categoryCount: categories.length },
    'Saving categories to repository',
  );
  try {
    await updateFile(
      'src/data/categories.json',
      JSON.stringify({ categories }, null, 2),
      'data: update categories via Admin',
    );
    logger.info(
      { categoryCount: categories.length },
      'Categories saved successfully',
    );
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to save categories',
    );
    throw error;
  }
}
