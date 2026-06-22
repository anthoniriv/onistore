import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog, getCategories, getTags, getGenres, type CatalogParams } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/site";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductGrid } from "@/components/ui";
import { PackageX } from "lucide-react";

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

  const [{ items, total, page, pages }, categories, tags, genres] = await Promise.all([
    getCatalog(params),
    getCategories(),
    getTags(),
    getGenres(),
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
          <CatalogFilters categories={categories} tags={tags} genres={genres} />
        </Suspense>

        <div>
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
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pages }).map((_, idx) => {
                const p = idx + 1;
                const params2 = new URLSearchParams(
                  Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))
                );
                params2.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/catalogo?${params2.toString()}`}
                    className={`grid h-10 min-w-10 place-items-center rounded-md border px-3 text-sm ${
                      p === page ? "border-oni-red bg-oni-red text-white" : "border-oni-line text-oni-bone hover:border-oni-red"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
