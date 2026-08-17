import { cartItems, isCartOpen } from '@/stores/cartStore';
import { useEffect } from 'preact/hooks';

export default function CartInitializer() {
  useEffect(() => {
    // this is to prevent load query params directly in the url
    isCartOpen.forceSet(null);

    const saved = sessionStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) cartItems.set(parsed);
      } catch {
        cartItems.set([]);
      }
    }
  }, []);
  return null;
}
