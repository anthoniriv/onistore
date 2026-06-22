import { formatPrice } from "./utils";
import { SITE_NAME, productUrl } from "./site";

export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "51993109998";

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/** Forma mínima de producto para armar mensajes */
export type WaProduct = {
  name: string;
  slug: string;
  priceCents: number;
  discountCents?: number | null;
  category?: string | null;
  sku?: string | null;
};

function header() {
  return `¡Hola ${SITE_NAME}! 👹`;
}

/** Líneas comunes: precio, categoría, SKU, link */
function details(p: WaProduct): string[] {
  const price = p.discountCents ?? p.priceCents;
  return [
    `*${p.name}*`,
    `💰 Precio: ${formatPrice(price)}`,
    p.category ? `📦 Categoría: ${p.category}` : "",
    p.sku ? `🔖 SKU: ${p.sku}` : "",
    `🔗 ${productUrl(p.slug)}`,
  ].filter(Boolean);
}

function build(intro: string, p: WaProduct, outro?: string): string {
  return [header(), ``, intro, ...details(p), outro ? `\n${outro}` : ""].filter(Boolean).join("\n");
}

// ----------------------------- Por intención -----------------------------

/** Consulta general / disponibilidad */
export function waStock(p: WaProduct): string {
  return waLink(build("Quiero consultar disponibilidad de:", p, "¿Está disponible? 🙌"));
}

/** Producto chancadito (outlet con detalle) */
export function waChancadito(p: WaProduct): string {
  return waLink(build("Me interesa este *chancadito* 🔥", p, "¿Qué detalle tiene y sigue disponible?"));
}

/** Preventa */
export function waPreorder(p: WaProduct): string {
  return waLink(build("Quiero *reservar en preventa*:", p, "¿Cómo es el proceso y la fecha de llegada? 📅"));
}

/** Agotado — avísame cuando llegue */
export function waSoldOut(p: WaProduct): string {
  return waLink(build("Este producto está agotado, ¿me avisas cuando llegue?", p, "🔔 Quiero que me reserves uno."));
}

/** Pedido bajo encargo / no está en catálogo */
export function waEncargo(p?: WaProduct): string {
  if (!p) return waLink(`${header()}\n\nQuiero hacer un *pedido bajo encargo* 🛒\n¿Me ayudas a conseguir un producto?`);
  return waLink(build("Quiero pedir *bajo encargo*:", p, "¿Lo pueden conseguir? 🙏"));
}

/** Compra directa de un producto */
export function waBuy(p: WaProduct, qty = 1): string {
  return waLink(build(`Quiero comprar (${qty}x):`, p, "¿Cómo coordinamos el pago? 🛍️"));
}

/** Compat: link de "consultar por un producto" usado en la ficha */
export function waProductLink(name: string, slug: string): string {
  return waStock({ name, slug, priceCents: 0 });
}

// ----------------------------- Carrito / pedido -----------------------------

type CartLine = { name: string; qty: number; priceCents: number };

/** Mensaje de pedido para el checkout */
export function waOrderMessage(opts: {
  code: string;
  items: CartLine[];
  subtotalCents: number;
  discountCents?: number;
  couponCode?: string;
  customerName?: string;
  channel?: string;
  delivery?: string;
  doc?: string;
}): string {
  const lines = opts.items
    .map((i) => `• ${i.qty}x ${i.name} — ${formatPrice(i.priceCents * i.qty)}`)
    .join("\n");
  const discount = opts.discountCents ?? 0;
  const total = opts.subtotalCents - discount;
  return [
    `${header()} Quiero hacer un pedido.`,
    ``,
    `*Pedido ${opts.code}*`,
    lines,
    ``,
    discount > 0 ? `Subtotal: ${formatPrice(opts.subtotalCents)}` : "",
    discount > 0 ? `🏷️ Cupón ${opts.couponCode ?? ""}: -${formatPrice(discount)}` : "",
    `*Total: ${formatPrice(total)}*`,
    opts.delivery ? `🚚 Entrega: ${opts.delivery}` : "",
    opts.doc ? `🧾 ${opts.doc}` : "",
    opts.channel ? `💳 Pago: ${opts.channel}` : "",
    opts.customerName ? `👤 A nombre de: ${opts.customerName}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
