import { atom } from 'nanostores';
import type { IProduct } from '@/types';
import {
  listDirectory,
  getFileContent,
  updateFile,
  deleteFile,
  getFileSha,
  uploadBinaryFile,
} from '@/lib/gateway';

export const productsStore = atom<IProduct[]>([]);
export const loadingStore = atom<boolean>(false);
export const errorStore = atom<string | null>(null);
export const loadingProgress = atom<number>(0);
export const savingStore = atom<boolean>(false);

/* ── helpers ─────────────────────────────────────────── */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve((reader.result as string).split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
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

/* ── create / update / delete product ────────────────── */

export async function createProduct(product: IProduct) {
  const path = `src/data/products/${product.id}.json`;
  const sha = await getFileSha(path);
  if (sha) throw new Error('Ya existe un producto con ese ID');
  await updateFile(
    path,
    JSON.stringify(product, null, 2),
    `data: create "${product.name}" via Admin`,
  );
}

export async function updateProduct(product: IProduct) {
  const path = `src/data/products/${product.id}.json`;
  await updateFile(
    path,
    JSON.stringify(product, null, 2),
    `data: update "${product.name}" via Admin`,
  );
}

export async function deleteProduct(id: string) {
  const path = `src/data/products/${id}.json`;
  await deleteFile(path, `data: delete "${id}" via Admin`);
  productsStore.set(productsStore.get().filter((p) => p.id !== id));
}

/* ── save with images ────────────────────────────────── */

export async function saveProductWithImages(opts: {
  product: IProduct;
  isNew: boolean;
  newFiles: File[];
  removedImages: string[];
}): Promise<void> {
  savingStore.set(true);
  const { product, isNew, newFiles, removedImages } = opts;

  try {
    /* 1. upload new images */
    const uploadedPaths: string[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const ext = file.name.split('.').pop() || 'webp';
      const fileName = `${slugify(product.id)}-${Date.now()}-${i}.${ext}`;
      const repoPath = `public/images/products/${fileName}`;
      const b64 = await fileToBase64(file);
      await uploadBinaryFile(
        repoPath,
        b64,
        `data: upload "${fileName}" via Admin`,
      );
      uploadedPaths.push(`/images/products/${fileName}`);
    }

    /* 2. delete removed images from repo */
    for (const imgUrl of removedImages) {
      try {
        const repoPath = imgUrl.replace(/^\/images\//, 'public/images/');
        await deleteFile(repoPath, `data: delete "${repoPath}" via Admin`);
      } catch {
        /* image may already be gone – ignore */
      }
    }

    /* 3. build final images array */
    const keptImages = product.images.filter(
      (img) => !removedImages.includes(img),
    );
    const finalImages = [...keptImages, ...uploadedPaths];

    const payload: IProduct = { ...product, images: finalImages };

    /* 4. write JSON */
    if (isNew) {
      await createProduct(payload);
    } else {
      await updateProduct(payload);
    }

    await loadProducts();
  } finally {
    savingStore.set(false);
  }
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
