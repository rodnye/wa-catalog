import { useStore } from '@nanostores/preact';
import { cartCount, toggleCart } from '@/stores/cartStore';

export default function CartToggle() {
  const count = useStore(cartCount);

  return (
    <button
      onClick={toggleCart}
      class="relative p-2 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
      aria-label="Carrito"
    >
      <svg
        class="w-6 h-6"
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
      {count > 0 && (
        <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
