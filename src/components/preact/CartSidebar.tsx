import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
  cartItems,
  isCartOpen,
  cartTotal,
  closeCart,
  removeFromCart,
  updateQuantity,
} from '@/stores/cartStore';
import { formatPrice, getWhatsAppUrl } from '@/utils/helpers';
import BaseImg from './BaseImg';
import IconShopCar from '~icons/assets/shop-car';
import IconClose from '~icons/mdi/close';
import IconDelete from '~icons/mdi/trash-can-outline';
import IconWhatsapp from '~icons/mdi/whatsapp';
import { useUrlStore } from '@/hooks/preact/useUrlStore';

export default function CartSidebar() {
  const items = useStore(cartItems);
  const total = useStore(cartTotal);
  const isOpen = useUrlStore(isCartOpen) === 'true';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    window.open(getWhatsAppUrl(items), '_blank');
  };

  return (
    <>
      {/* Overlay */}
      <div
        class={`cart-overlay fixed inset-0 bg-black/50 z-[60] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Panel */}
      <aside
        class={`cart-panel fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[70] shadow-2xl flex flex-col ${
          isOpen ? '' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 class="font-display font-bold text-lg text-gray-800 flex items-center gap-2">
            <IconShopCar class="size-5 text-primary-500" />
            <span> Mi Carrito </span>
          </h2>
          <button
            onClick={closeCart}
            class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div class="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div class="flex flex-col items-center justify-center h-full text-center">
              <span class="text-6xl mb-4">🛒</span>
              <p class="text-gray-500 font-medium mb-1">
                Tu carrito está vacío
              </p>
              <p class="text-sm text-gray-400">
                Agrega productos para comenzar
              </p>
            </div>
          ) : (
            <div class="space-y-3">
              {items.map((item) => (
                <div key={item.id} class="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <BaseImg
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-800 truncate">
                      {item.name}
                    </h4>
                    <p class="text-sm font-bold text-primary-600 mt-0.5">
                      {formatPrice(item.price)}
                    </p>
                    <div class="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        class="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors"
                      >
                        -
                      </button>
                      <span class="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        class="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    class="p-1.5 text-gray-300 hover:text-red-400 transition-colors self-start"
                  >
                    <IconDelete class="size-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div class="border-t border-gray-100 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600 font-medium">Total</span>
              <span class="font-display font-bold text-xl text-primary-600">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              class="w-full btn-accent text-base py-3 flex items-center justify-center gap-2"
            >
              <IconWhatsapp class="size-6" />
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
