import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Demografías + géneros de manga/anime. Idempotente (upsert por slug).
export const GENRES: { slug: string; name: string; kind: "DEMOGRAFIA" | "GENERO" }[] = [
  // Demografías
  { slug: "shonen", name: "Shōnen", kind: "DEMOGRAFIA" },
  { slug: "seinen", name: "Seinen", kind: "DEMOGRAFIA" },
  { slug: "shoujo", name: "Shōjo", kind: "DEMOGRAFIA" },
  { slug: "josei", name: "Josei", kind: "DEMOGRAFIA" },
  { slug: "kodomo", name: "Kodomo", kind: "DEMOGRAFIA" },
  // Géneros
  { slug: "accion", name: "Acción", kind: "GENERO" },
  { slug: "aventura", name: "Aventura", kind: "GENERO" },
  { slug: "comedia", name: "Comedia", kind: "GENERO" },
  { slug: "drama", name: "Drama", kind: "GENERO" },
  { slug: "romance", name: "Romance", kind: "GENERO" },
  { slug: "terror", name: "Terror", kind: "GENERO" },
  { slug: "suspenso", name: "Suspenso", kind: "GENERO" },
  { slug: "misterio", name: "Misterio", kind: "GENERO" },
  { slug: "fantasia", name: "Fantasía", kind: "GENERO" },
  { slug: "ciencia-ficcion", name: "Ciencia ficción", kind: "GENERO" },
  { slug: "slice-of-life", name: "Recuentos de la vida", kind: "GENERO" },
  { slug: "deportes", name: "Deportes", kind: "GENERO" },
  { slug: "mecha", name: "Mecha", kind: "GENERO" },
  { slug: "isekai", name: "Isekai", kind: "GENERO" },
  { slug: "historico", name: "Histórico", kind: "GENERO" },
  { slug: "psicologico", name: "Psicológico", kind: "GENERO" },
  { slug: "sobrenatural", name: "Sobrenatural", kind: "GENERO" },
  { slug: "ecchi", name: "Ecchi", kind: "GENERO" },
  { slug: "harem", name: "Harem", kind: "GENERO" },
  { slug: "bl", name: "BL (Boys Love)", kind: "GENERO" },
  { slug: "gl", name: "GL (Girls Love)", kind: "GENERO" },
  { slug: "gore", name: "Gore", kind: "GENERO" },
  { slug: "magia", name: "Magia", kind: "GENERO" },
];

async function main() {
  for (let i = 0; i < GENRES.length; i++) {
    const g = GENRES[i];
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name, kind: g.kind, order: i },
      create: { ...g, order: i },
    });
  }
  console.log(`✅ ${GENRES.length} géneros cargados (sin tocar productos)`);
}

if (process.argv[1]?.endsWith("seed-genres.ts")) {
  main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
}
