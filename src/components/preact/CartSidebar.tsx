import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
  cartItems,
  isCartOpen,
  cartTotal,
  closeCart,
  removeFromCart,
  updateQuantity,
  getWhatsAppUrl,
} from '@/stores/cartStore';
import { formatPrice } from '@/utils/helpers';

export default function CartSidebar() {
  const items = useStore(cartItems);
  const open = useStore(isCartOpen);
  const total = useStore(cartTotal);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleCheckout = () => {
    window.open(getWhatsAppUrl(), '_blank');
  };

  return (
    <>
      {/* Overlay */}
      <div
        class={`cart-overlay fixed inset-0 bg-black/50 z-[60] ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Panel */}
      <aside
        class={`cart-panel fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[70] shadow-2xl flex flex-col ${
          open ? '' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 class="font-display font-bold text-lg text-gray-800 flex items-center gap-2">
            <svg
              class="w-5 h-5 text-primary-500"
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
            Mi Carrito
          </h2>
          <button
            onClick={closeCart}
            class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
                  <img
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/images/placeholder.jpg';
                    }}
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
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span class="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        class="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors"
                      >
                        <svg
                          class="w-3 h-3"
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
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    class="p-1.5 text-gray-300 hover:text-red-400 transition-colors self-start"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
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
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
