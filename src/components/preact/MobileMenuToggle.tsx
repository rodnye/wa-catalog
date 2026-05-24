import { toggleMobileMenu } from '@/stores/mobileMenuStore';
import IconMenu from '~icons/mdi/menu';

export default function MobileMenuToggle() {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  };

  return (
    <button
      onClick={handleClick}
      class="shrink-0 lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
      aria-label="Menú de categorías"
    >
      <IconMenu class="size-5" />
    </button>
  );
}
