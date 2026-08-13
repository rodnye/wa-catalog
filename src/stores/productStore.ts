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

export const productsStore = atom<IProduct[]>([]);
export const loadingStore = atom<boolean>(false);
export const errorStore = atom<string | null>(null);
export const loadingProgress = atom<number>(0);
export const savingStore = atom<boolean>(false);

/* ── helpers ─────────────────────────────────────────── */

function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/* ── load ────────────────────────────────────────────── */

export async function loadProducts() {
  loadingStore.set(true);
  errorStore.set(null);
  loadingProgress.set(0);

  try {
    const files = await listDirectory('src/data/products');
    const jsonFiles = files.filter((f) => f.name.endsWith('.json'));
    const total = jsonFiles.length;
    const products: IProduct[] = [];
    const BATCH = 20;

    for (let i = 0; i < total; i += BATCH) {
      const batch = jsonFiles.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (file) => {
          const content = await getFileContent(file.path);
          const p = JSON.parse(content);
          if (!p.id) p.id = file.name.replace(/\.json$/, '');
          return p as IProduct;
        }),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') products.push(r.value);
      }
      loadingProgress.set(
        Math.min(100, Math.round(((i + batch.length) / total) * 100)),
      );
    }

    productsStore.set(products);
  } catch (e) {
    errorStore.set(
      e instanceof Error ? e.message : 'Error al cargar productos',
    );
  } finally {
    loadingStore.set(false);
  }
}

/* ── save  ────────────────────────────────── */

export async function saveProductWithImages({
  product,
  newFiles,
  removedImages,
}: {
  product: IProduct;
  newFiles: File[];
  removedImages: string[];
}): Promise<void> {
  savingStore.set(true);

  try {
    /* 1. upload new images */
    const persistImages: FileEntry[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const ext = file.name.split('.').pop() || 'webp';
      const fileName = `${slugify(product.id)}-${Date.now()}-${i}.${ext}`;
      const repoPath = `public/images/products/${fileName}`;
      persistImages.push({
        content: await fileToArrayBuffer(file),
        path: repoPath,
      });
    }

    /* 2. remove images */
    const persistRemoved = removedImages.map((relativePath) =>
      relativePath.replace(/^\/images\//, 'public/images/'),
    );

    /* 3. prepare final product */
    const keptImages = product.images.filter(
      (img) => !removedImages.includes(img),
    );
    const finalImages = [
      ...keptImages,
      ...persistImages.map(
        ({ path }) => `/images/products/${path.split('/').pop()}`,
      ),
    ];
    const newProduct: IProduct = {
      ...product,
      images: finalImages,
    };

    const persistUpdated = [
      ...persistImages,
      {
        path: `src/data/products/${product.id}.json`,
        content: JSON.stringify(newProduct, null, 2),
      },
    ];

    await getGateway().operations.persistFiles(persistUpdated, persistRemoved, {
      author: getCommitAuthor(),
      commitMessage: `data: updated ${product.id} from Admin`,
    });

    // reload
    await loadProducts();
  } finally {
    savingStore.set(false);
  }
}

export async function deleteProducts(ids: string[]) {
  const persistRemoved: string[] = [];
  const products = productsStore.get();

  for (const id of ids) {
    const product = products.find((p) => p.id === id);
    if (!product) {
      console.warn('delete products ' + id + ' not found');
      continue;
    }

    persistRemoved.push(
      `src/data/products/${product.id}.json`,
      ...product.images.map((relativePath) =>
        relativePath.replace(/^\/images\//, 'public/images/'),
      ),
    );
  }

  return getGateway().operations.deleteFiles(persistRemoved, {
    author: getCommitAuthor(),
    commitMessage: 'data: removed ' + ids.join(', ') + ' from Admin',
  });
}

/* ── categories (read / write categories.json) ───────── */

export interface ICategory {
  label: string;
  key: string;
  emoji: string;
}

export async function loadCategoriesFromRepo(): Promise<ICategory[]> {
  const raw = await getFileContent('src/data/categories.json');
  const data = JSON.parse(raw);
  return data.categories ?? [];
}

export async function saveCategoriesToRepo(
  categories: ICategory[],
): Promise<void> {
  await updateFile(
    'src/data/categories.json',
    JSON.stringify({ categories }, null, 2),
    'data: update categories via Admin',
  );
}
