import { atomUrlParam } from '@/utils/url-params';

export const isMenuOpen = atomUrlParam('menu_open');

export const openMenu = () => isMenuOpen.set('true');
export const closeMenu = () => {
  if (isMenuOpen.get() === 'true') window.history.back();
};
export const toggleMenu = () => {
  isMenuOpen.set(isMenuOpen.get() ? null : 'true');
};
