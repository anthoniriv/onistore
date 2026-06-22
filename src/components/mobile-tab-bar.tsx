"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Flame, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/chancaditos", label: "Chancaditos", icon: Flame },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const openCart = useCart((s) => s.open);
  const mounted = useIsClient();

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-oni-line bg-oni-ink/95 backdrop-blur md:hidden">
      <nav className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px]",
                active ? "text-oni-red" : "text-oni-ash"
              )}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </Link>
          );
        })}
        <button onClick={openCart} className="relative flex flex-col items-center gap-0.5 py-2 text-[11px] text-oni-ash">
          <ShoppingBag className="h-5 w-5" />
          Carrito
          {mounted && count > 0 && (
            <span className="absolute right-5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-oni-red px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
