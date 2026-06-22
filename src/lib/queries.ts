import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export type CatalogParams = {
  category?: string; // slug
  condition?: string; // NUEVO|...
  q?: string;
  min?: number; // soles
  max?: number;
  tag?: string;
  genre?: string;
  chancaditos?: boolean;
  sort?: "nuevo" | "precio-asc" | "precio-desc" | "nombre";
  page?: number;
  perPage?: number;
};

export function effectivePriceCents(p: { priceCents: number; discountCents: number | null }) {
  return p.discountCents ?? p.priceCents;
}

export async function getCatalog(params: CatalogParams) {
  const perPage = params.perPage ?? 12;
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.ProductWhereInput = { active: true };
  if (params.category) where.category = { slug: params.category };
  if (params.condition) where.condition = params.condition;
  if (params.chancaditos) where.isChancadito = true;
  if (params.tag) where.tags = { some: { tag: { slug: params.tag } } };
  if (params.genre) where.genres = { some: { genre: { slug: params.genre } } };
  if (params.q) {
    const tokens = params.q.trim().split(/\s+/).filter(Boolean);
    if (tokens.length)
      where.AND = tokens.map((t) => ({
        OR: [
          { name: { contains: t } },
          { anime: { contains: t } },
          { brand: { contains: t } },
          { description: { contains: t } },
        ],
      }));
  }

  // Filtro de precio sobre priceCents (aprox; el efectivo se calcula en UI)
  if (params.min != null || params.max != null) {
    where.priceCents = {};
    if (params.min != null) where.priceCents.gte = params.min * 100;
    if (params.max != null) where.priceCents.lte = params.max * 100;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "precio-asc"
      ? { priceCents: "asc" }
      : params.sort === "precio-desc"
        ? { priceCents: "desc" }
        : params.sort === "nombre"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.ceil(total / perPage) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      tags: { include: { tag: true } },
      genres: { include: { genre: true } },
    },
  });
}

export async function getRelated(categoryId: string, excludeId: string, take = 6) {
  return prisma.product.findMany({
    where: { categoryId, active: true, id: { not: excludeId } },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    take,
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

export async function getGenres() {
  return prisma.genre.findMany({ orderBy: [{ kind: "asc" }, { order: "asc" }] });
}

export async function getFeatured(take = 8) {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    take,
  });
}

export async function getLatest(take = 10) {
  return prisma.product.findMany({
    where: { active: true },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getChancaditos(take = 8) {
  return prisma.product.findMany({
    where: { active: true, isChancadito: true },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    take,
  });
}

/** Búsqueda ligera para el preview en vivo del buscador */
export async function searchProducts(q: string, take = 6) {
  const tokens = q.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return prisma.product.findMany({
    where: {
      active: true,
      AND: tokens.map((t) => ({
        OR: [{ name: { contains: t } }, { anime: { contains: t } }, { brand: { contains: t } }],
      })),
    },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
    orderBy: { featured: "desc" },
    take,
  });
}

/** Sugerencias para el admin: productos con título parecido, para copiar su data. */
export async function getProductSuggestions(q: string, excludeId?: string) {
  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !/^(vol|vol\.|tomo|n°|nro|#)$/.test(t));
  if (!tokens.length) return [];

  const candidates = await prisma.product.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      OR: tokens.flatMap((t) => [{ name: { contains: t } }, { anime: { contains: t } }]),
    },
    include: {
      images: { orderBy: { order: "asc" } },
      genres: true,
      category: true,
    },
    take: 25,
  });

  // Rankea por cantidad de tokens presentes en nombre+anime
  const scored = candidates
    .map((p) => {
      const hay = `${p.name} ${p.anime ?? ""}`.toLowerCase();
      const score = tokens.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score >= Math.min(2, tokens.length))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(({ p }) => ({
    id: p.id,
    name: p.name,
    anime: p.anime,
    brand: p.brand,
    sku: p.sku,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    priceCents: p.priceCents,
    discountCents: p.discountCents,
    condition: p.condition,
    description: p.description,
    isChancadito: p.isChancadito,
    chancaditoReason: p.chancaditoReason,
    images: p.images.map((i) => i.url),
    genreIds: p.genres.map((g) => g.genreId),
  }));
}

export async function getBanners() {
  return prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export type CatalogItem = Awaited<ReturnType<typeof getCatalog>>["items"][number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
