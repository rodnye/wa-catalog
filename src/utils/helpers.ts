export const BASE_URL = import.meta.env.BASE_URL || '/';
export const APP_NAME = import.meta.env.PUBLIC_APP_NAME || 'La Gitana Shop';
export const APP_DESC =
  import.meta.env.PUBLIC_APP_DESC ||
  'Tienda variada con los mejores productos al mejor precio.';
export const BANNER_TITLE =
  import.meta.env.PUBLIC_BANNER_TITLE || 'Descubre lo que necesitas';
export const BANNER_CONTENT =
  import.meta.env.PUBLIC_BANNER_CONTENT ||
  'Productos variados con la mejor calidad y precios accesibles. ¡Tu tienda de confianza te espera!';
export const WHATSAPP_NUMBER =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER || '5351234567';
export const WHATSAPP_LINK = 'https://wa.me/' + WHATSAPP_NUMBER;
export const APP_VIP_CODE = import.meta.env.PUBLIC_APP_VIP_CODE || '1234';

/**
 *
 */
export const isBaseUrl = (path: string) => path.startsWith(BASE_URL);

/**
 * Return true if is a /vip url
 */
export const isVipUrl = (path: string) =>
  clearUrlBase(path).split('/')[1] === 'vip';

/**
 *
 */
export const resolveUrlBase = (path: string) => {
  if (!path.startsWith('/') || isBaseUrl(path)) return path;

  return BASE_URL.replace(/\/$/, '') + path;
};

/**
 * Resolve the url with BASE_URL and VIP url
 *
 * @param from Assign `Astro.url.pathname`
 * @param to - Target url to parse
 */
export const resolveUrlFrom = (from: string, to: string) => {
  let resolved = to;

  if (!to.startsWith('/')) return resolved;
  if (isBaseUrl(to)) resolved = clearUrlBase(resolved);
  if (isVipUrl(from)) resolved = '/vip/' + APP_VIP_CODE + resolved;

  return resolveUrlBase(resolved);
};

/**
 *
 */
export const clearUrlBase = (path: string) =>
  path.replace(new RegExp('^' + BASE_URL.replace(/\/$/, '')), '');

export function formatPrice(price: number): string {
  return price.toLocaleString('es-CU') + ' CUP';
}

export function buildWhatsAppMessage(
  items: { nombre: string; precio: number; quantity: number }[],
  total: number,
): string {
  const lines = items.map(
    (item) =>
      `• ${item.nombre} x${item.quantity} — ${item.precio.toLocaleString('es-CU')} CUP`,
  );
  const message = [
    '🛒 *Nuevo Pedido*',
    '',
    ...lines,
    '',
    `*Total: ${total.toLocaleString('es-CU')} CUP*`,
  ].join('\n');
  return encodeURIComponent(message);
}

export function getWhatsAppUrl(
  items: { nombre: string; precio: number; quantity: number }[],
  total: number,
): string {
  const message = buildWhatsAppMessage(items, total);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
