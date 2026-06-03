import { atomUrlParam } from '@/utils/url-params';

export const isMobileMenuOpen = atomUrlParam('menu_open');

export const openMobileMenu = () => isMobileMenuOpen.set('true');
export const closeMobileMenu = () => {
  if (isMobileMenuOpen.get() === 'true') window.history.back();
};
export const toggleMobileMenu = () =>
  isMobileMenuOpen.set(isMobileMenuOpen.get() ? null : 'true');
