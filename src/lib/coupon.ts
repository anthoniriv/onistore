import { formatPrice } from "./utils";

export type CouponType = "PERCENT" | "FIXED";

export type CouponLike = {
  code: string;
  type: string; // PERCENT | FIXED
  value: number;
  minSubtotalCents: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
};

/** Cupón aplicado guardado en el carrito (cliente) */
export type AppliedCoupon = {
  code: string;
  type: string;
  value: number;
  minSubtotalCents: number;
};

export function computeDiscountCents(type: string, value: number, subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  if (type === "PERCENT") return Math.min(subtotalCents, Math.round((subtotalCents * value) / 100));
  return Math.min(value, subtotalCents); // FIXED
}

export type CouponResult = { ok: boolean; error?: string; discountCents: number };

/** Validación pura (la usan la API y la creación de pedido) */
export function validateCoupon(c: CouponLike | null, subtotalCents: number): CouponResult {
  if (!c) return { ok: false, error: "Cupón no encontrado", discountCents: 0 };
  if (!c.active) return { ok: false, error: "Cupón no disponible", discountCents: 0 };
  if (c.expiresAt && c.expiresAt.getTime() < Date.now()) return { ok: false, error: "Cupón vencido", discountCents: 0 };
  if (c.maxUses != null && c.usedCount >= c.maxUses) return { ok: false, error: "Cupón agotado", discountCents: 0 };
  if (subtotalCents < c.minSubtotalCents)
    return { ok: false, error: `Compra mínima de ${formatPrice(c.minSubtotalCents)}`, discountCents: 0 };
  return { ok: true, discountCents: computeDiscountCents(c.type, c.value, subtotalCents) };
}

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

export function couponLabel(type: string, value: number): string {
  return type === "PERCENT" ? `${value}% de descuento` : `${formatPrice(value)} de descuento`;
}
