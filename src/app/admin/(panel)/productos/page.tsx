import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, FileSpreadsheet, FileJson } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductsManager } from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;
type SP = { [k: string]: string | string[] | undefined };

export default async function AdminProductos({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, typeof sp.page === "string" ? Number(sp.page) || 1 : 1);

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean);
    where.AND = tokens.map((t) => ({
      OR: [
        { name: { contains: t } },
        { anime: { contains: t } },
        { sku: { contains: t } },
        { brand: { contains: t } },
      ],
    }));
  }

  // Solo la página actual llega a la DB (antes: findMany sin límite = toda la tabla).
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/productos?${qs}` : "/admin/productos";
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">
          Productos <span className="text-base text-oni-ash">({total})</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/export?format=xlsx"
            className="flex items-center gap-2 rounded-md border border-oni-line px-3 py-2.5 text-sm font-semibold text-oni-bone hover:border-oni-red"
            title="Exportar a Excel (una hoja por editorial)"
          >
            <FileSpreadsheet className="h-4 w-4 text-oni-gold" /> XLSX
          </a>
          <a
            href="/api/admin/export?format=json"
            className="flex items-center gap-2 rounded-md border border-oni-line px-3 py-2.5 text-sm font-semibold text-oni-bone hover:border-oni-red"
            title="Exportar a JSON (agrupado por editorial)"
          >
            <FileJson className="h-4 w-4 text-oni-gold" /> JSON
          </a>
          <Link href="/admin/productos/nuevo" className="flex items-center gap-2 rounded-md bg-oni-red px-4 py-2.5 font-semibold text-white hover:bg-oni-red-dark">
            <Plus className="h-4 w-4" /> Nuevo
          </Link>
        </div>
      </div>

      {/* Búsqueda server-side (GET) */}
      <form action="/admin/productos" className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-oni-ash" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, anime, SKU o marca…"
            className="h-11 w-full rounded-md border border-oni-line bg-oni-surface pl-9 pr-3 text-sm outline-none transition-colors focus:border-oni-red"
          />
        </div>
        <button type="submit" className="rounded-md bg-oni-red px-4 text-sm font-semibold text-white hover:bg-oni-red-dark">
          Buscar
        </button>
        {q && (
          <Link href="/admin/productos" className="flex items-center rounded-md border border-oni-line px-4 text-sm text-oni-ash hover:border-oni-red">
            Limpiar
          </Link>
        )}
      </form>

      {q && (
        <p className="mt-2 text-sm text-oni-ash">
          {total} resultado{total === 1 ? "" : "s"} para “{q}”
        </p>
      )}

      <ProductsManager products={products} categories={categories} />

      {pages > 1 && (
        <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} rel="prev" className="flex h-10 items-center gap-1 rounded-md border border-oni-line px-3 text-oni-bone hover:border-oni-red">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Link>
          ) : (
            <span aria-hidden className="flex h-10 items-center gap-1 rounded-md border border-oni-line/50 px-3 text-oni-line">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </span>
          )}
          <span className="text-oni-ash">Página {page} de {pages}</span>
          {page < pages ? (
            <Link href={hrefFor(page + 1)} rel="next" className="flex h-10 items-center gap-1 rounded-md border border-oni-line px-3 text-oni-bone hover:border-oni-red">
              Siguiente <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-hidden className="flex h-10 items-center gap-1 rounded-md border border-oni-line/50 px-3 text-oni-line">
              Siguiente <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
