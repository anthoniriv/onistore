import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog, getCategories, getTags, getGenres, getBrands, type CatalogParams } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/site";
import { CatalogFilters } from "@/components/catalog-filters";
import { ActiveFilters } from "@/components/active-filters";
import { ProductGrid } from "@/components/ui";
import { PackageX, ChevronLeft, ChevronRight } from "lucide-react";

type SP = { [k: string]: string | string[] | undefined };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const q = get("q");
  const catSlug = get("category");
  if (q) return { title: `Buscar: ${q}`, robots: { index: false, follow: true } };
  if (catSlug) {
    const c = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (c)
      return {
        title: `${c.name} de Anime y Manga`,
        description: `Compra ${c.name} de anime y manga en ${SITE_NAME}. Stock real, envíos a todo el Perú y recojo en Arenales.`,
        alternates: { canonical: `/catalogo?category=${catSlug}` },
      };
  }
  return {
    title: "Catálogo completo",
    description: `Explora todo el catálogo de ${SITE_NAME}: figuras, manga, Blu-ray, anime goods y bookarts. Envíos a todo el Perú.`,
    alternates: { canonical: "/catalogo" },
  };
}

function parse(sp: SP): CatalogParams {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const n = (k: string) => (s(k) ? Number(s(k)) : undefined);
  return {
    category: s("category"),
    condition: s("condition"),
    q: s("q"),
    tag: s("tag"),
    genre: s("genre"),
    brand: s("brand"),
    oferta: s("oferta") === "1",
    availability: s("availability") as CatalogParams["availability"],
    min: n("min"),
    max: n("max"),
    chancaditos: s("chancaditos") === "1",
    sort: (s("sort") as CatalogParams["sort"]) ?? "nuevo",
    page: n("page") ?? 1,
  };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const params = parse(sp);

  const [{ items, total, page, pages }, categories, tags, genres, brands] = await Promise.all([
    getCatalog(params),
    getCategories(),
    getTags(),
    getGenres(),
    getBrands(),
  ]);

  const activeCat = categories.find((c) => c.slug === params.category);
  const title = params.q
    ? `Resultados: "${params.q}"`
    : activeCat
      ? activeCat.name
      : "Catálogo completo";

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
      <nav className="mb-3 text-xs text-oni-ash">
        <Link href="/" className="hover:text-oni-red">Inicio</Link> / <span className="text-oni-bone">Catálogo</span>
      </nav>
      <h1 className="font-display text-3xl text-oni-bone sm:text-4xl">{title}</h1>
      <p className="mt-1 text-sm text-oni-ash">{total} producto{total === 1 ? "" : "s"}</p>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-10" />}>
          <CatalogFilters categories={categories} tags={tags} genres={genres} brands={brands} />
        </Suspense>

        <div>
          <Suspense fallback={null}>
            <ActiveFilters categories={categories} tags={tags} genres={genres} brands={brands} />
          </Suspense>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-oni border border-oni-line bg-oni-ink py-20 text-center">
              <PackageX className="h-12 w-12 text-oni-line" />
              <p className="text-oni-ash">No encontramos productos con esos filtros.</p>
              <Link href="/catalogo" className="rounded-md bg-oni-red px-5 py-2.5 font-semibold text-white">Ver todo</Link>
            </div>
          ) : (
            <ProductGrid products={items} />
          )}

          {pages > 1 && (
            <Pagination sp={sp} page={page} pages={pages} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Ventana de páginas: 1 … alrededor-del-actual … última. Evita el muro de números. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({ sp, page, pages }: { sp: SP; page: number; pages: number }) {
  const hrefFor = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))
    );
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  };

  const cell = "grid h-11 min-w-11 place-items-center rounded-md border px-3 text-sm transition-colors";
  const items = pageWindow(page, pages);

  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" aria-label="Página anterior"
          className={`${cell} border-oni-line text-oni-bone hover:border-oni-red`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className={`${cell} border-oni-line/50 text-oni-line`}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {items.map((it, idx) =>
        it === "gap" ? (
          <span key={`gap-${idx}`} aria-hidden className="px-1 text-oni-ash">…</span>
        ) : it === page ? (
          <span key={it} aria-current="page"
            className={`${cell} border-oni-red bg-oni-red font-semibold text-white`}>
            {it}
          </span>
        ) : (
          <Link key={it} href={hrefFor(it)} aria-label={`Página ${it}`}
            className={`${cell} border-oni-line text-oni-bone hover:border-oni-red`}>
            {it}
          </Link>
        )
      )}

      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" aria-label="Página siguiente"
          className={`${cell} border-oni-line text-oni-bone hover:border-oni-red`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className={`${cell} border-oni-line/50 text-oni-line`}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
