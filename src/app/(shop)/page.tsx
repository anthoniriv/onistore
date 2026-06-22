import Link from "next/link";
import { Flame, ShieldCheck, Truck, Radio, Store, CreditCard } from "lucide-react";
import { getBanners, getCategories, getFeatured, getLatest, getChancaditos } from "@/lib/queries";
import { HeroSlider } from "@/components/hero-slider";
import { CategoryChips } from "@/components/category-chips";
import { SectionHeader, ProductRail } from "@/components/ui";

const TRUST = [
  { icon: Truck, t: "Envíos a todo el Perú" },
  { icon: Store, t: "Recojo en Arenales" },
  { icon: ShieldCheck, t: "Productos garantizados" },
  { icon: CreditCard, t: "Yape · Plin · Transferencia" },
];

export default async function HomePage() {
  const [banners, categories, featured, latest, chancaditos] = await Promise.all([
    getBanners(),
    getCategories(),
    getFeatured(10),
    getLatest(10),
    getChancaditos(10),
  ]);

  return (
    <div>
      {/* Hero full-bleed (todo el ancho) */}
      <HeroSlider slides={banners} />

      {/* Bloque de confianza (arriba del fold) */}
      <div className="border-b border-oni-line bg-oni-ink">
        <ul className="no-scrollbar mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-3 md:grid md:grid-cols-4 md:gap-3 md:px-6">
          {TRUST.map((b) => (
            <li key={b.t} className="flex shrink-0 items-center gap-2 text-xs text-oni-bone md:justify-center md:text-sm">
              <b.icon className="h-4 w-4 shrink-0 text-oni-red" />
              <span className="whitespace-nowrap">{b.t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
      <section>
        <CategoryChips categories={categories} />
      </section>

      {featured.length > 0 && (
        <section className="mt-8">
          <SectionHeader kicker="Lo más pedido" title="Destacados" href="/catalogo" />
          <ProductRail products={featured} />
        </section>
      )}

      {latest.length > 0 && (
        <section className="mt-8">
          <SectionHeader kicker="Recién llegados" title="Últimos agregados" href="/catalogo?sort=nuevo" />
          <ProductRail products={latest} />
        </section>
      )}

      <section className="mt-8 overflow-hidden rounded-oni border border-oni-red/40 bg-gradient-to-r from-oni-red/20 to-oni-ink p-5 sm:p-8">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-9 w-9 text-oni-red" />
            <div>
              <h2 className="font-display text-2xl text-oni-bone sm:text-3xl">Zona Chancaditos</h2>
              <p className="text-sm text-oni-ash">Outlet con detalles, precios de demonio 🔥</p>
            </div>
          </div>
          <Link href="/chancaditos" className="rounded-md bg-oni-red px-5 py-2.5 font-display tracking-wide text-white hover:bg-oni-red-dark">
            Ver ofertas
          </Link>
        </div>
        {chancaditos.length > 0 && (
          <div className="mt-5">
            <ProductRail products={chancaditos} />
          </div>
        )}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Productos garantizados", s: "Calidad verificada antes de enviar" },
          { icon: Truck, t: "Envíos a todo el Perú", s: "Coordinamos por WhatsApp" },
          { icon: Radio, t: "LIVE Vie–Dom", s: "Sorteos, drops y precios especiales" },
        ].map((b) => (
          <div key={b.t} className="flex items-center gap-3 rounded-oni border border-oni-line bg-oni-ink p-4">
            <b.icon className="h-7 w-7 text-oni-gold" />
            <div>
              <p className="font-semibold text-oni-bone">{b.t}</p>
              <p className="text-xs text-oni-ash">{b.s}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="my-10 rounded-oni border border-oni-line bg-oni-ink p-6 text-center">
        <p className="font-jp text-sm text-oni-gold">本物の魂</p>
        <h2 className="mt-1 font-display text-2xl text-oni-bone sm:text-3xl">¿No encuentras lo que buscas?</h2>
        <p className="mt-1 text-sm text-oni-ash">Escríbenos y lo conseguimos para ti.</p>
        <Link href="/contacto" className="mt-4 inline-block rounded-md bg-oni-red px-6 py-3 font-display tracking-wide text-white hover:bg-oni-red-dark">
          Contáctanos
        </Link>
      </section>
      </div>
    </div>
  );
}
