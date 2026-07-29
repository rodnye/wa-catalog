import { atom } from 'nanostores';
import type { IProduct } from '@/types';
import {
  listDirectory,
  getFileContent,
  updateFile,
  deleteFile,
  getFileSha,
} from '@/lib/gateway';

export const productsStore = atom<IProduct[]>([]);
export const loadingStore = atom<boolean>(false);
export const errorStore = atom<string | null>(null);

// Cargar todos los productos desde el repositorio
export async function loadProducts() {
  loadingStore.set(true);
  errorStore.set(null);
  try {
    const files = await listDirectory('src/data/products');
    const jsonFiles = files.filter((f) => f.name.endsWith('.json'));
    const products: IProduct[] = [];
    for (const file of jsonFiles) {
      const content = await getFileContent(file.path);
      try {
        const product = JSON.parse(content);
        // Asignar id desde el nombre del archivo si no tiene
        if (!product.id) {
          product.id = file.name.replace(/\.json$/, '');
        }
        products.push(product);
      } catch (e) {
        console.error(`Error parsing ${file.name}:`, e);
      }
    }
    productsStore.set(products);
  } catch (error) {
    errorStore.set(
      error instanceof Error ? error.message : 'Error al cargar productos',
    );
  } finally {
    loadingStore.set(false);
  }
}

// Crear un nuevo producto (escribe un nuevo archivo JSON)
export async function createProduct(product: IProduct) {
  const fileName = `${product.id}.json`;
  const path = `src/data/products/${fileName}`;
  // Verificar si ya existe
  const existingSha = await getFileSha(path);
  if (existingSha) {
    throw new Error('Ya existe un producto con ese ID');
  }
  await updateFile(
    path,
    JSON.stringify(product, null, 2),
    `Crear producto ${product.name}`,
  );
  await loadProducts(); // recargar lista
}

// Actualizar un producto existente
export async function updateProduct(product: IProduct) {
  const fileName = `${product.id}.json`;
  const path = `src/data/products/${fileName}`;
  const sha = await getFileSha(path);
  if (!sha) {
    throw new Error('El producto no existe');
  }
  await updateFile(
    path,
    JSON.stringify(product, null, 2),
    `Actualizar producto ${product.name}`,
    sha,
  );
  await loadProducts();
}

// Eliminar un producto
export async function deleteProduct(id: string) {
  const fileName = `${id}.json`;
  const path = `src/data/products/${fileName}`;
  const sha = await getFileSha(path);
  if (!sha) {
    throw new Error('El producto no existe');
  }
  await deleteFile(path, `Eliminar producto ${id}`, sha);
  await loadProducts();
}
