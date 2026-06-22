"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useIsClient } from "@/lib/use-is-client";

export function CartButton({ className }: { className?: string }) {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const open = useCart((s) => s.open);
  const mounted = useIsClient();

  return (
    <button
      onClick={open}
      aria-label="Abrir carrito"
      className={`relative grid h-10 w-10 place-items-center rounded-md text-oni-bone hover:text-oni-red transition-colors ${className ?? ""}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-oni-red px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
