import { atom } from 'nanostores';

export const isMobileMenuOpen = atom<boolean>(false);

export const openMobileMenu = () => isMobileMenuOpen.set(true);
export const closeMobileMenu = () => isMobileMenuOpen.set(false);
export const toggleMobileMenu = () =>
  isMobileMenuOpen.set(!isMobileMenuOpen.get());
