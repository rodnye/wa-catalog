import { addToCart } from '@/stores/cartStore';
import IconShopCar from '~icons/assets/shop-car';

interface Props {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  className?: string;
  variant?: 'primary' | 'accent' | 'full';
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  className = '',
  variant = 'primary',
}: Props) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productId, productName, productPrice, productImage);
  };

  const baseClasses =
    variant === 'full'
      ? 'w-full btn-accent text-base py-3.5 flex items-center justify-center gap-2'
      : 'w-full btn-primary text-sm flex items-center justify-center gap-2';

  return (
    <button onClick={handleClick} class={`${baseClasses} ${className}`}>
      {variant === 'full' ? (
        <>
          <IconShopCar class="size-5" />
          Agregar al Carrito
        </>
      ) : (
        <>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Agregar
        </>
      )}
    </button>
  );
}
