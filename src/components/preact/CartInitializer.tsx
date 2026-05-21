import { useEffect } from 'preact/hooks';
import { loadCartFromStorage } from '@/stores/cartStore';

export default function CartInitializer() {
  useEffect(() => {
    loadCartFromStorage();
  }, []);
  return null;
}
