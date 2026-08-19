import {
  getCommitAuthor,
  getFileContent,
  getGateway,
  listDirectory,
} from '@/lib/gateway';
import { fileToArrayBuffer, slugify } from '@/stores/productStore';
import logger from '@/utils/logger';
import type { IProduct } from '@catalog/shared';
import type { FileEntry } from '@rodny/decap-gateway';
import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
} from '@tanstack/preact-query';

/**
 * Product data query options
 */
const productOptions = (id: string) =>
  queryOptions({
    queryKey: ['products', 'data', id],
    queryFn: async ({ queryKey }) => {
      const content = await getFileContent(
        'src/data/products/' + queryKey[2] + '.json',
      );
      const p = JSON.parse(content);
      if (!p.id) p.id = id;
      return p as IProduct;
    },
  });

/**
 * Products List query options
 */
const listProductOptions = () =>
  queryOptions({
    queryKey: ['products', 'list'],
    queryFn: async () =>
      (await listDirectory('src/data/products')).map(({ name }) =>
        name.replace(/\.json$/, ''),
      ),
  });

export const useProduct = (id: string) => useQuery(productOptions(id));
export const useProductsList = () => useQuery(listProductOptions());
export const useProducts = () => {
  const list = useProductsList();

  return useQueries({
    queries: list.data?.map((id) => productOptions(id)) || [],
  });
};

//
// Mutations
//
export const useDeleteProductMutation = () => {
  return useMutation({
    mutationFn: async (ids: string[], { client }) => {
      logger.info({ productIds: ids }, 'Deleting products');
      const persistRemoved: string[] = [];

      // get products list
      const products = await client.ensureQueryData(listProductOptions());

      const foundedIds: string[] = [];
      for (const id of ids) {
        if (!products.find((target) => target === id)) {
          logger.warn({ id }, 'Product not found to remove');
          continue;
        }
        const product = await client.ensureQueryData(productOptions(id));
        foundedIds.push(id);
        persistRemoved.push(
          `src/data/products/${product.id}.json`,
          ...product.images.map((relativePath) =>
            relativePath.replace(/^\/images\//, 'public/images/'),
          ),
        );
        logger.debug(
          { productId: id, imageCount: product.images.length },
          'Product marked for deletion',
        );
      }

      try {
        await getGateway().operations.deleteFiles(persistRemoved, {
          author: getCommitAuthor(),
          commitMessage: 'data: removed ' + ids.join(', ') + ' from Admin',
        });

        // remove cache
        client.setQueryData(
          listProductOptions().queryKey,
          products.filter((id) => !foundedIds.includes(id)),
        );
        for (const id of foundedIds) client.removeQueries(productOptions(id));

        logger.info(
          { productIds: foundedIds, removedCount: persistRemoved.length },
          'Products deleted successfully',
        );
      } catch (error) {
        logger.error(
          {
            productIds: ids,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to delete products',
        );
        throw error;
      }
    },
  });
};
export const useUpdateProductMutation = () => {
  return useMutation({
    mutationFn: async (
      {
        product,
        newFiles,
        removedImages,
      }: {
        product: IProduct;
        newFiles: File[];
        removedImages: string[];
      },
      { client },
    ) => {
      logger.info(
        {
          productId: product.id,
          newFileCount: newFiles.length,
          removedImageCount: removedImages.length,
        },
        'Saving product with images',
      );
      const products = await client.ensureQueryData(listProductOptions());

      try {
        /* 1. upload new images */
        const persistImages: FileEntry[] = [];

        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const ext = file.name.split('.').pop() || 'webp';
          const fileName = `${slugify(product.id)}-${Date.now()}-${i}.${ext}`;
          const repoPath = `public/images/${fileName}`;
          persistImages.push({
            content: await fileToArrayBuffer(file),
            path: repoPath,
          });
          logger.debug({ fileName, repoPath }, 'Prepared image for upload');
        }

        /* 2. remove images */
        const persistRemoved = removedImages.map((relativePath) =>
          relativePath.replace(/^\/images\//, 'public/images/'),
        );
        if (persistRemoved.length > 0) {
          logger.debug(
            { removedPaths: persistRemoved },
            'Images marked for removal',
          );
        }

        /* 3. prepare final product */
        const keptImages = product.images.filter(
          (img) => !removedImages.includes(img),
        );
        const finalImages = [
          ...keptImages,
          ...persistImages.map(
            ({ path }) => `/images/${path.split('/').pop()}`,
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

        logger.info(
          { productId: product.id, imageCount: finalImages.length },
          'Persisting product data',
        );

        await getGateway().operations.persistFiles(
          persistUpdated,
          persistRemoved,
          {
            author: getCommitAuthor(),
            commitMessage: `data: updated ${product.id} from Admin`,
          },
        );

        logger.info(
          { productId: product.id },
          'Product saved successfully, reloading products',
        );

        if (!products.find((id) => id === product.id))
          // is a new product, push on list
          client.setQueryData(listProductOptions().queryKey, [
            product.id,
            ...products,
          ]);

        // set data
        client.setQueryData(productOptions(product.id).queryKey, newProduct);
      } catch (error) {
        logger.error(
          {
            productId: product.id,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to save product',
        );
        throw error;
      }
    },
  });
};
