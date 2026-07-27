import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { isMenuOpen, closeMenu } from '@/stores/menuStore';
import { getCategories } from '@/lib/categories';
import { useUrlStore } from '@/hooks/preact/useUrlStore';
import BaseLink from './BaseLink';
import IconClose from '~icons/mdi/close';
import { resolveUrlFrom } from '@/utils/helpers';

interface Props {
  activeCategory?: string;
}

export default function MenuSidebar({ activeCategory = '' }: Props) {
  const isOpen = useUrlStore(isMenuOpen) === 'true';
  const categories = getCategories();
  const [currentPath, setCurrentPath] = useState('/');

  useLayoutEffect(() => {
    setCurrentPath(location.pathname);
  });
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        class={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Panel */}
      <div
        class={`flex flex-col fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out transform lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 class="font-display font-bold text-lg text-gray-800">
            Categorías
          </h2>
          <button
            onClick={closeMenu}
            class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <IconClose class="size-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav class="flex-1 overflow-y-auto p-4">
          <ul class="space-y-2">
            <li>
              <BaseLink
                href={resolveUrlFrom(currentPath, '/')}
                onClick={closeMenu}
                class={[
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  activeCategory === ''
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600',
                ].join(' ')}
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🏠</span>
                  <span>Todo</span>
                </div>
              </BaseLink>
            </li>
            {categories.map((cat) => (
              <li key={cat.key}>
                <BaseLink
                  href={resolveUrlFrom(currentPath, `/categories/${cat.slug}`)}
                  onClick={closeMenu}
                  class={[
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    activeCategory === cat.key
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600',
                  ].join(' ')}
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </div>
                </BaseLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
