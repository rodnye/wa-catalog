export const BASE_URL = import.meta.env.BASE_URL || '/';
export const APP_NAME = import.meta.env.PUBLIC_APP_NAME || 'WA-Catalog';
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

export const resolveUrl = (path: string) => {
  return path.startsWith('/') ? BASE_URL.replace(/\/$/, '') + path : path;
};

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
