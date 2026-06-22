"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Store } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { CheckoutStepper } from "@/components/checkout-stepper";
import { CouponInput } from "@/components/coupon-input";

export default function CarritoPage() {
  const { items, setQty, remove } = useCart();
  const subtotal = useCart((s) => s.subtotalCents());
  const discount = useCart((s) => s.discountCents());
  const total = useCart((s) => s.totalCents());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <CheckoutStepper current={1} />
        <div className="rounded-oni border border-oni-line bg-oni-ink py-16 text-center">
          <ShoppingBag className="mx-auto h-14 w-14 text-oni-line" />
          <h1 className="mt-3 font-display text-2xl">Tu carrito está vacío</h1>
          <p className="mt-1 text-sm text-oni-ash">Aún no agregaste productos.</p>
          <Link href="/catalogo" className="mt-4 inline-block rounded-md bg-oni-red px-6 py-3 font-display tracking-wide text-white hover:bg-oni-red-dark">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <CheckoutStepper current={1} />
      <h1 className="font-display text-3xl text-oni-bone sm:text-4xl">Carrito</h1>
      <p className="mt-1 text-sm text-oni-ash">{items.length} producto{items.length === 1 ? "" : "s"}</p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Lista de productos */}
        <div className="overflow-hidden rounded-oni border border-oni-line bg-oni-ink">
          {/* Encabezado (desktop) */}
          <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-oni-line px-4 py-3 text-xs uppercase tracking-wide text-oni-ash sm:grid">
            <span>Producto</span>
            <span className="w-28 text-center">Cantidad</span>
            <span className="w-24 text-right">Subtotal</span>
          </div>

          <ul className="divide-y divide-oni-line">
            {items.map((it) => (
              <li key={it.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:gap-4">
                <div className="flex items-center gap-3">
                  <Link href={`/producto/${it.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-oni-line bg-oni-surface">
                    <Image src={it.image ?? "/placeholders/p1.svg"} alt={it.name} fill unoptimized={(it.image ?? "").endsWith(".svg")} sizes="64px" className="object-contain p-1" />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/producto/${it.slug}`} className="line-clamp-2 text-sm font-medium text-oni-bone hover:text-oni-red">{it.name}</Link>
                    <p className="mt-0.5 text-sm font-semibold text-oni-red">{formatPrice(it.priceCents)}</p>
                    <button onClick={() => remove(it.id)} className="mt-1 flex items-center gap-1 text-xs text-oni-ash hover:text-oni-red sm:hidden">
                      <Trash2 className="h-3.5 w-3.5" /> Quitar
                    </button>
                  </div>
                </div>

                <div className="flex items-center rounded-md border border-oni-line sm:mx-auto sm:w-28 sm:justify-center">
                  <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Menos" className="grid h-9 w-9 place-items-center text-oni-bone">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm">{it.qty}</span>
                  <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Más" className="grid h-9 w-9 place-items-center text-oni-bone">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:w-24 sm:justify-end">
                  <span className="text-xs text-oni-ash sm:hidden">Subtotal</span>
                  <span className="font-semibold text-oni-bone">{formatPrice(it.priceCents * it.qty)}</span>
                  <button onClick={() => remove(it.id)} aria-label="Quitar" className="ml-3 hidden text-oni-ash hover:text-oni-red sm:block">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-oni-line p-4">
            <Link href="/catalogo" className="text-sm text-oni-ash hover:text-oni-red">← Seguir comprando</Link>
          </div>
        </div>

        {/* Resumen */}
        <aside className="h-fit rounded-oni border border-oni-line bg-oni-ink p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Resumen del pedido</h2>

          <div className="mt-4">
            <CouponInput />
          </div>

          <div className="mt-4 flex justify-between text-sm">
            <span className="text-oni-ash">Subtotal</span>
            <span className="text-oni-bone">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-oni-ash">Descuento</span>
              <span className="font-semibold text-emerald-400">−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-oni-ash">Envío</span>
            <span className="text-oni-ash">Se coordina en el siguiente paso</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-oni-line pt-4">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl text-oni-bone">{formatPrice(total)}</span>
          </div>

          <Link href="/checkout" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark">
            Continuar al checkout <ArrowRight className="h-5 w-5" />
          </Link>

          <div className="mt-4 space-y-2 text-xs text-oni-ash">
            <p className="flex items-center gap-2"><Store className="h-4 w-4 text-oni-red" /> Recojo gratis en Arenales</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-oni-red" /> Productos garantizados</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
