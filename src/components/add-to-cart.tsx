"use client";

import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type Props = {
  product: Omit<CartItem, "qty">;
  variant?: "icon" | "full";
  className?: string;
};

export function AddToCart({ product, variant = "icon", className }: Props) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  if (variant === "icon") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        disabled={soldOut}
        aria-label="Agregar al carrito"
        className={cn(
          "grid h-9 w-9 place-items-center rounded-md bg-oni-red text-white transition-colors hover:bg-oni-red-dark disabled:bg-oni-line disabled:text-oni-ash",
          className
        )}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-oni-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-oni-bone disabled:text-oni-ash" disabled={soldOut}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="grid h-11 w-11 place-items-center text-oni-bone disabled:text-oni-ash" disabled={soldOut}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-oni-ash">{soldOut ? "Sin stock" : `${product.stock} disponibles`}</span>
      </div>
      <button
        onClick={handleAdd}
        disabled={soldOut}
        className="flex h-12 items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white transition-colors hover:bg-oni-red-dark disabled:bg-oni-line disabled:text-oni-ash"
      >
        {added ? <><Check className="h-5 w-5" /> Agregado</> : <><ShoppingCart className="h-5 w-5" /> {soldOut ? "Agotado" : "Agregar al carrito"}</>}
      </button>
    </div>
  );
}
