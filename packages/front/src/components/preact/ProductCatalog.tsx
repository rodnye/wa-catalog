import { useMemo } from 'preact/hooks';
import { searchQuery } from '@/stores/searchStore';
import type { IProduct } from '@/types';
import { BANNER_CONTENT, BANNER_TITLE, WHATSAPP_LINK } from '@/utils/helpers';
import BaseLink from './BaseLink';
import { useUrlStore } from '@/hooks/preact/useUrlStore';
import IconShopBag from '~icons/mdi/shopping';
import IconStar from '~icons/mdi/star';
import ProductCard from './ProductCard';

interface ProductCatalogProps {
  products: IProduct[];
  withHero: boolean;
  currentPath?: string;
}

export default function ProductCatalog({
  products,
  withHero = false,
  currentPath,
}: ProductCatalogProps) {
  const query = useUrlStore(searchQuery);
  const isSearching = !!query;

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
              <ProductCard key={p.id} product={p} currentPath={currentPath} />
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

  const featured = products.filter((p) => p.featured);
  const nonFeatured = products.filter((p) => !p.featured);
  return (
    <>
      {/* Hero */}
      {withHero && (
        <section class="mb-8">
          <div class="bg-gradient-to-br from-primary-400 via-primary-500 to-sand-500 md:rounded-3xl -mx-4 -mt-6 md:m-auto p-6 sm:p-10 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
            <div class="relative z-10">
              <h1 class="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-3">
                {BANNER_TITLE}
              </h1>
              <p class="text-white/80 text-base sm:text-lg max-w-lg mb-5">
                {BANNER_CONTENT}
              </p>
              <div class="flex flex-col xs:flex-row gap-3">
                <BaseLink
                  href="#products"
                  class="bg-white text-primary-600 font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                  Ver Productos
                </BaseLink>
                <BaseLink
                  href={WHATSAPP_LINK}
                  target="_blank"
                  class="bg-white/20 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  Contáctanos
                </BaseLink>
              </div>
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section class="mb-10">
          <div class="flex items-center justify-between mb-5">
            <h2 class="flex items-center font-display font-bold text-xl sm:text-2xl text-gray-800">
              <IconStar class="size-8 mr-2 text-yellow-400" />
              <span> Destacados </span>
            </h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featured.map((p) => (
              <ProductCard product={p} currentPath={currentPath} />
            ))}
          </div>
        </section>
      )}

      <section id="products" class="mb-10">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display font-bold text-xl sm:text-2xl flex items-center text-gray-800">
            <IconShopBag class="size-8 mr-2 text-purple-500" />
            <span> Todos los productos </span>
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {nonFeatured.map((p) => (
            <ProductCard product={p} currentPath={currentPath} />
          ))}
        </div>
      </section>
    </>
  );
}
