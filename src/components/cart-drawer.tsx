"use client";

import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, close, remove, setQty } = useCart();
  const subtotal = useCart((s) => s.subtotalCents());
  const pathname = usePathname();

  // Cerrar al navegar
  useEffect(() => {
    close();
  }, [pathname, close]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className={`fixed inset-0 z-[80] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-oni-line bg-oni-ink shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-oni-line p-4">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-oni-red" /> Tu carrito
          </h2>
          <button onClick={close} aria-label="Cerrar" className="grid h-9 w-9 place-items-center text-oni-ash hover:text-oni-bone">
            <X className="h-6 w-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-oni-line" />
            <p className="text-oni-ash">Tu carrito está vacío</p>
            <Link href="/catalogo" onClick={close} className="rounded-md bg-oni-red px-5 py-2.5 font-semibold text-white">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-3">
                {items.map((it) => (
                  <li key={it.id} className="flex gap-3 rounded-md border border-oni-line bg-oni-surface p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image ?? "/placeholders/p1.svg"} alt={it.name} className="h-16 w-16 shrink-0 rounded object-cover" />
                    <div className="flex flex-1 flex-col">
                      <p className="line-clamp-2 text-sm font-medium">{it.name}</p>
                      <p className="text-sm font-bold text-oni-red">{formatPrice(it.priceCents)}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded border border-oni-line">
                          <button onClick={() => setQty(it.id, it.qty - 1)} className="grid h-7 w-7 place-items-center text-oni-bone">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-sm">{it.qty}</span>
                          <button onClick={() => setQty(it.id, it.qty + 1)} className="grid h-7 w-7 place-items-center text-oni-bone">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => remove(it.id)} aria-label="Quitar" className="grid h-7 w-7 place-items-center text-oni-ash hover:text-oni-red">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-oni-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-oni-ash">Subtotal</span>
                <span className="font-display text-xl text-oni-bone">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-3 text-xs text-oni-ash">Envío y método de pago se coordinan en el siguiente paso.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="flex h-12 items-center justify-center rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark"
              >
                Finalizar pedido
              </Link>
              <Link
                href="/carrito"
                onClick={close}
                className="mt-2 flex h-11 items-center justify-center rounded-md border border-oni-line font-medium text-oni-bone hover:border-oni-red"
              >
                Ver carrito
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
