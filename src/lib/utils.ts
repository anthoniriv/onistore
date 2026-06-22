import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Céntimos de Sol -> "S/ 89.90" */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CONDITIONS = ["NUEVO", "SEMINUEVO", "USADO", "PREORDER"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CONDITION_LABEL: Record<string, string> = {
  NUEVO: "Nuevo",
  SEMINUEVO: "Seminuevo",
  USADO: "Usado",
  PREORDER: "Preventa",
};

export const ORDER_STATUS = [
  "PENDIENTE",
  "PAGADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  PREPARANDO: "Preparando",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};
