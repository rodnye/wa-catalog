import AddToCartButton from './AddToCartButton';
import type { IProduct } from '@/types';
import { formatPrice } from '@/utils/helpers';
import BaseLink from './BaseLink';
import BaseImg from './BaseImg';
import IconStar from '~icons/mdi/star';

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
            <span class="flex items-center absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              <IconStar class="text-yellow-400 size-5 mr-1" />
              <span> Destacado </span>
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

export default function ProductCatalog({
  products,
  linkParser,
}: ProductCatalogProps) {
  return (
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} linkParser={linkParser} />
      ))}
    </div>
  );
}
