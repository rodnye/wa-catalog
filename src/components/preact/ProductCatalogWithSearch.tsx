import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';
import { searchQuery } from '@/stores/searchStore';
import AddToCartButton from './AddToCartButton';
import type { IProduct } from '@/types';
import { formatPrice } from '@/utils/helpers';
import BaseLink from './BaseLink';
import BaseImg from './BaseImg';

/**
 * @deprecated
 */
interface ProductCatalogProps {
  products: IProduct[];
  linkParser: ProductCardProps['linkParser'];
}

interface ProductCardProps {
  product: IProduct;
  linkParser?: (p: IProduct) => string;
}

function ProductCard({
  product,
  linkParser = (p) => `/products/${p.id}`,
}: ProductCardProps) {
  return (
    <article
      class="product-card card group cursor-pointer"
      data-product-id={product.id}
    >
      <BaseLink href={linkParser(product)} class="block">
        <div class="relative overflow-hidden aspect-square bg-gray-50">
          <BaseImg
            src={product.images[0] || '/images/placeholder.jpg'}
            alt={product.name}
            class="product-img w-full h-full object-cover"
            loading="lazy"
          />
          {product.featured && (
            <span class="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              ⭐ Destacado
            </span>
          )}
          {!product.available && (
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span class="bg-white text-gray-800 font-bold px-4 py-2 rounded-xl">
                Agotado
              </span>
            </div>
          )}
        </div>
        <div class="p-4">
          <div class="flex flex-wrap gap-1.5 mb-2">
            {product.categories.slice(0, 2).map((cat) => (
              <span key={cat} class="badge">
                {cat}
              </span>
            ))}
          </div>
          <h3 class="font-semibold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p class="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
          <span class="font-display font-bold text-primary-600 text-lg">
            {formatPrice(product.price)}
          </span>
        </div>
      </BaseLink>
      {product.available && (
        <div class="px-4 pb-4">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            productImage={product.images[0] || ''}
          />
        </div>
      )}
    </article>
  );
}

/**
 * @deprecated
 */
export default function ProductCatalog({
  products,
  linkParser,
}: ProductCatalogProps) {
  const query = useStore(searchQuery);
  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categories.some((c) => c.toLowerCase().includes(q)),
    );
  }, [query, products, isSearching]);

  const clearSearch = () => searchQuery.set('');

  if (isSearching) {
    return (
      <div>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sm text-gray-500">Resultados para:</span>
          <span class="text-sm font-semibold text-primary-600">{query}</span>
          <button
            onClick={clearSearch}
            class="text-xs text-gray-400 hover:text-red-400 transition-colors ml-2"
          >
            ✕ Limpiar
          </button>
        </div>
        {filtered.length > 0 ? (
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p class="text-center text-gray-400 py-12">
            <span class="text-4xl block mb-3">🔍</span>
            No encontramos productos con esa búsqueda
          </p>
        )}
      </div>
    );
  }

  return (
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} linkParser={linkParser} />
      ))}
    </div>
  );
}
