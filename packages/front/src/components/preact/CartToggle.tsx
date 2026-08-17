import { useStore } from '@nanostores/preact';
import { cartCount, toggleCart } from '@/stores/cartStore';
import IconShopCar from '~icons/assets/shop-car';

export default function CartToggle() {
  const count = useStore(cartCount);

  return (
    <button
      onClick={toggleCart}
      class="relative p-2 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
      aria-label="Carrito"
    >
      <IconShopCar class="size-6" />
      {count > 0 && (
        <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
