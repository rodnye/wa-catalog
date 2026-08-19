import { getFileContent, updateFile } from '@/lib/gateway';
import logger from '@/utils/logger';
import type { ICategory } from '@catalog/shared';
import { queryOptions, useMutation, useQuery } from '@tanstack/preact-query';

export const categoriesOptions = () =>
  queryOptions({
    queryKey: ['categories'],
    queryFn: async () => {
      logger.info('Loading categories from repository');
      try {
        const raw = await getFileContent('src/data/categories.json');
        const data = JSON.parse(raw) as { categories: ICategory[] };
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
    },
  });

export const useCategories = () => useQuery(categoriesOptions());

export const useUpdateCategoriesMutation = () =>
  useMutation({
    mutationFn: async (categories: ICategory[], { client }) => {
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
        client.setQueryData(categoriesOptions().queryKey, categories);
      } catch (error) {
        logger.error(
          { error: error instanceof Error ? error.message : String(error) },
          'Failed to save categories',
        );
        throw error;
      }
    },
  });
