export const WHATSAPP_NUMBER =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER || '5351234567';

export const resolveUrl = (path: string) => {
  return path.startsWith('/')
    ? import.meta.env.BASE_URL.replace(/\/$/, '') + path
    : path;
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
