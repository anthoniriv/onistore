import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/queries";
import { OniLogo } from "./brand";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { MobileMenu } from "./mobile-menu";
import { HeaderNav } from "./header-nav";

export async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 border-b border-oni-line bg-oni-black/90 backdrop-blur">
      {/* Barra superior marquee */}
      <div className="overflow-hidden bg-oni-red text-white">
        <div className="flex w-max animate-marquee whitespace-nowrap py-1.5 text-xs font-semibold tracking-wide">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex">
              <span className="px-6">🔥 ENVÍOS A TODO EL PERÚ</span>
              <span className="px-6">👹 LIVE VIERNES A DOMINGO 7–9PM</span>
              <span className="px-6">⚡ NUEVOS DROPS CADA SEMANA</span>
              <span className="px-6">🎁 ZONA CHANCADITOS — OUTLET</span>
            </span>
          ))}
        </div>
      </div>

      {/* Barra principal */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 md:px-6">
        <MobileMenu categories={categories} />

        <Link href="/" className="shrink-0">
          <OniLogo />
        </Link>

        {/* Búsqueda desktop */}
        <div className="ml-4 hidden flex-1 md:block">
          <SearchBar />
        </div>

        {/* Nav desktop con estado activo */}
        <Suspense fallback={<div className="ml-auto hidden md:block" />}>
          <HeaderNav categories={categories} />
        </Suspense>

        <div className="ml-auto flex items-center md:ml-2">
          <div className="md:hidden">
            <SearchBar variant="icon" />
          </div>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
