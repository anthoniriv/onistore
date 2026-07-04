/**
 * Agrega la categoría "CD" a la base de datos SIN borrar datos.
 * Úsalo en producción (el seed borra todo, este no).
 *
 *   npx tsx scripts/add-cd-category.ts          → con el DATABASE_URL del entorno actual
 *   DATABASE_URL="postgres://..." npx tsx scripts/add-cd-category.ts
 *
 * Idempotente: si "cd" ya existe, no hace nada.
 * Inserta CD justo después de Blu-ray y recorre las categorías siguientes.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.category.findUnique({ where: { slug: "cd" } });
  if (existing) {
    console.log("ℹ️  La categoría CD ya existe. Nada que hacer.");
    return;
  }

  const bluray = await prisma.category.findUnique({ where: { slug: "blu-ray" } });
  const targetOrder = (bluray?.order ?? 3) + 1;

  await prisma.$transaction([
    // Hacer sitio: las categorías en o después del target bajan una posición.
    prisma.category.updateMany({
      where: { order: { gte: targetOrder } },
      data: { order: { increment: 1 } },
    }),
    prisma.category.create({
      data: { slug: "cd", name: "CD", icon: "Disc3", order: targetOrder },
    }),
  ]);

  const cats = await prisma.category.findMany({ orderBy: { order: "asc" }, select: { name: true, order: true } });
  console.log("✅ Categoría CD agregada. Orden actual:");
  for (const c of cats) console.log(`   ${c.order}. ${c.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
