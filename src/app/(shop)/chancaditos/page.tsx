import { Suspense } from "react";
import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { getCatalog, getCategories, getTags, getGenres, getBrands, type CatalogParams } from "@/lib/queries";
import { CatalogFilters } from "@/components/catalog-filters";
import { ActiveFilters } from "@/components/active-filters";
import { ProductGrid } from "@/components/ui";

export const metadata: Metadata = {
  title: "Zona Chancaditos — Outlet",
  description: "Outlet de figuras, manga y merch con pequeños detalles a precios rebajados.",
};

type SP = { [k: string]: string | string[] | undefined };

export default async function ChancaditosPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const n = (k: string) => (s(k) ? Number(s(k)) : undefined);

  const params: CatalogParams = {
    chancaditos: true,
    category: s("category"),
    condition: s("condition"),
    tag: s("tag"),
    genre: s("genre"),
    brand: s("brand"),
    oferta: s("oferta") === "1",
    availability: s("availability") as CatalogParams["availability"],
    min: n("min"),
    max: n("max"),
    sort: (s("sort") as CatalogParams["sort"]) ?? "nuevo",
    page: n("page") ?? 1,
    perPage: 24,
  };

  const [{ items, total }, categories, tags, genres, brands] = await Promise.all([
    getCatalog(params),
    getCategories(),
    getTags(),
    getGenres(),
    getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
      <div className="overflow-hidden rounded-oni border border-oni-red/40 bg-gradient-to-br from-oni-red/25 via-oni-ink to-oni-black p-6 sm:p-10">
        <div className="flex items-center gap-3">
          <Flame className="h-10 w-10 text-oni-red" />
          <div>
            <p className="font-jp text-sm text-oni-gold">アウトレット</p>
            <h1 className="font-display text-3xl text-oni-bone sm:text-5xl">Zona Chancaditos</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm text-oni-ash sm:text-base">
          Productos con pequeños detalles (caja golpeada, blister abierto, leve desgaste) a precios de demonio. La esencia
          está intacta — solo el precio cambió. 🔥
        </p>
      </div>

      <p className="mt-5 text-sm text-oni-ash">{total} oferta{total === 1 ? "" : "s"}</p>

      <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-10" />}>
          <CatalogFilters categories={categories} tags={tags} genres={genres} brands={brands} hideChancaditos />
        </Suspense>
        <div>
          <Suspense fallback={null}>
            <ActiveFilters categories={categories} tags={tags} genres={genres} brands={brands} hideChancaditos />
          </Suspense>
          {items.length === 0 ? (
            <div className="rounded-oni border border-oni-line bg-oni-ink py-20 text-center text-oni-ash">
              Por ahora no hay chancaditos. ¡Vuelve pronto! 👹
            </div>
          ) : (
            <ProductGrid products={items} />
          )}
        </div>
      </div>
    </div>
  );
}
