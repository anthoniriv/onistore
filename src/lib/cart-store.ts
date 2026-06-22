"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeDiscountCents, type AppliedCoupon } from "./coupon";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  image?: string;
  qty: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (c: AppliedCoupon) => void;
  removeCoupon: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  subtotalCents: () => number;
  discountCents: () => number;
  totalCents: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            const next = Math.min(existing.qty + qty, item.stock || 99);
            return {
              items: s.items.map((i) => (i.id === item.id ? { ...i, qty: next } : i)),
              isOpen: true,
            };
          }
          return { items: [...s.items, { ...item, qty }], isOpen: true };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [], coupon: null }),
      applyCoupon: (c) => set({ coupon: c }),
      removeCoupon: () => set({ coupon: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotalCents: () => get().items.reduce((n, i) => n + i.priceCents * i.qty, 0),
      discountCents: () => {
        const c = get().coupon;
        const sub = get().subtotalCents();
        if (!c || sub < c.minSubtotalCents) return 0;
        return computeDiscountCents(c.type, c.value, sub);
      },
      totalCents: () => Math.max(0, get().subtotalCents() - get().discountCents()),
    }),
    { name: "onistore-cart" }
  )
);
