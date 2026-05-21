import { addToCart } from '@/stores/cartStore';

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
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
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
