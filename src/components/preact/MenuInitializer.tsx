import { isMenuOpen } from '@/stores/menuStore';
import { useEffect } from 'preact/hooks';

export default function MenuInitializer() {
  useEffect(() => {
    // this is to prevent load query params directly in the url
    isMenuOpen.forceSet(null);
  }, []);
  return null;
}
