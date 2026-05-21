import type { ICartItem } from '@/types';
import { WHATSAPP_NUMBER } from '@/utils/helpers';
import { atom, computed } from 'nanostores';

export const cartItems = atom<ICartItem[]>([]);
export const isCartOpen = atom<boolean>(false);

export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

function persist() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cartItems.get()));
  }
}

export function loadCartFromStorage() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) cartItems.set(parsed);
    } catch {
      cartItems.set([]);
    }
  }
}

export function addToCart(
  id: string,
  name: string,
  price: number,
  image: string,
) {
  const current = cartItems.get();
  const existing = current.find((item) => item.id === id);
  if (existing) {
    cartItems.set(
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  } else {
    cartItems.set([...current, { id, name, price, image, quantity: 1 }]);
  }
  isCartOpen.set(true);
  persist();
}

export function removeFromCart(id: string) {
  cartItems.set(cartItems.get().filter((item) => item.id !== id));
  persist();
}

export function updateQuantity(id: string, delta: number) {
  const current = cartItems.get();
  const updated = current
    .map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    })
    .filter(Boolean) as ICartItem[];
  cartItems.set(updated);
  persist();
}

export function openCart() {
  isCartOpen.set(true);
}

export function closeCart() {
  isCartOpen.set(false);
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}

function buildMessage(): string {
  const items = cartItems.get();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const lines = items.map(
    (item) =>
      `• ${item.name} x${item.quantity} — ${item.price.toLocaleString('es-CU')} CUP`,
  );
  return [
    '🛒 *Nuevo Pedido*',
    '',
    ...lines,
    '',
    `*Total: ${total.toLocaleString('es-CU')} CUP*`,
  ].join('\n');
}

export function getWhatsAppUrl(): string {
  const message = encodeURIComponent(buildMessage());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
