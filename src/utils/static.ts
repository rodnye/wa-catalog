import { loadAllProducts } from '@/lib/products';
import { APP_VIP_CODE } from './helpers';
import { getCategories } from '@/lib/categories';

/**
 *
 */
export const getStaticProductPaths = async (
  opts: Parameters<typeof loadAllProducts>[0] = {},
) => {
  const allProducts = await loadAllProducts(opts);
  return allProducts.map((product) => ({
    params: {
      id: product.id,
      vipcode: APP_VIP_CODE,
    },
    props: { product },
  }));
};

/**
 *
 */
export const getStaticCategoryPaths = async (
  opts: Parameters<typeof loadAllProducts>[0] = {},
) => {
  const allProducts = await loadAllProducts(opts);
  const categories = getCategories();

  return categories.map((cat) => {
    const params = { category: cat.slug, vipcode: APP_VIP_CODE };
    const props = {
      category: cat,
      products: allProducts.filter((p) => p.categories.includes(cat.key)),
    };
    return {
      params,
      props,
    };
  });
};
