import { CONDITION_LABEL } from "./utils";

export type ProductState = {
  condition: string;
  stock: number;
  priceCents: number;
  discountCents: number | null;
  isChancadito: boolean;
  isNew: boolean;
};

export type BadgeKind = "oferta" | "chancadito" | "preventa" | "nuevo" | "condicion";
export type BadgeDescriptor = { kind: BadgeKind; label: string };

/** Estado derivado de un producto para la card / ficha */
export function getProductState(p: ProductState) {
  const isPreorder = p.condition === "PREORDER";
  const soldOut = !isPreorder && p.stock <= 0;
  const hasDiscount = p.discountCents != null && p.discountCents < p.priceCents;
  const lowStock = !soldOut && !isPreorder && p.stock > 0 && p.stock <= 3;
  const discountPct = hasDiscount
    ? Math.round((1 - (p.discountCents as number) / p.priceCents) * 100)
    : 0;
  return { isPreorder, soldOut, hasDiscount, discountPct, lowStock };
}

/** Badges priorizados (devuelve máx `max`, en orden de importancia) */
export function getBadges(p: ProductState, max = 2): BadgeDescriptor[] {
  const s = getProductState(p);
  const all: BadgeDescriptor[] = [];

  if (s.isPreorder) all.push({ kind: "preventa", label: "Preventa" });
  if (p.isChancadito) all.push({ kind: "chancadito", label: "Chancadito" });
  if (s.hasDiscount) all.push({ kind: "oferta", label: `-${s.discountPct}%` });
  if (p.isNew && !s.isPreorder) all.push({ kind: "nuevo", label: "Nuevo" });
  // La condición solo se muestra si no es "nuevo" de fábrica (reduce ruido)
  if (!s.isPreorder && (p.condition === "SEMINUEVO" || p.condition === "USADO"))
    all.push({ kind: "condicion", label: CONDITION_LABEL[p.condition] });

  return all.slice(0, max);
}

/** Qué CTA principal mostrar */
export type PrimaryCta = "cart" | "preorder" | "soldout";
export function primaryCta(p: ProductState): PrimaryCta {
  const s = getProductState(p);
  if (s.isPreorder) return "preorder";
  if (s.soldOut) return "soldout";
  return "cart";
}
