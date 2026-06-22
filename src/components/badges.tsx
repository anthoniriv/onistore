import { CONDITION_LABEL, cn } from "@/lib/utils";
import type { BadgeDescriptor, BadgeKind } from "@/lib/card-state";

/* Estilos solo dentro de la paleta de marca: negro / rojo / stone gray / blanco */
const BADGE_STYLE: Record<BadgeKind, string> = {
  oferta: "bg-oni-red text-white",
  chancadito: "bg-oni-stone text-oni-black",
  preventa: "border border-oni-red text-oni-red bg-oni-black/50 backdrop-blur-sm",
  nuevo: "border border-oni-stone/60 text-oni-stone bg-oni-black/50 backdrop-blur-sm",
  condicion: "border border-oni-ash text-oni-ash bg-oni-black/50 backdrop-blur-sm",
};

export function ProductBadge({ kind, label, className }: BadgeDescriptor & { className?: string }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none",
        BADGE_STYLE[kind],
        className
      )}
    >
      {label}
    </span>
  );
}

export function BadgeRow({ badges, className }: { badges: BadgeDescriptor[]; className?: string }) {
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap items-start gap-1", className)}>
      {badges.map((b) => (
        <ProductBadge key={b.kind} kind={b.kind} label={b.label} />
      ))}
    </div>
  );
}

/* ---- Badges sueltos (usados en la ficha de producto) ---- */

const COND_STYLE: Record<string, string> = {
  NUEVO: "border border-oni-stone/60 text-oni-stone",
  SEMINUEVO: "border border-oni-red text-oni-red",
  USADO: "border border-oni-ash text-oni-ash",
  PREORDER: "bg-oni-red text-white",
};

export function ConditionBadge({ condition, className }: { condition: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none",
        COND_STYLE[condition] ?? "border border-oni-line text-oni-bone",
        className
      )}
    >
      {CONDITION_LABEL[condition] ?? condition}
    </span>
  );
}

export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null;
  return (
    <span className={cn("rounded bg-oni-red px-1.5 py-0.5 text-[10px] font-bold leading-none text-white", className)}>
      -{percent}%
    </span>
  );
}

export function ChancaditoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("rounded bg-oni-stone px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-oni-black", className)}>
      Chancadito
    </span>
  );
}
