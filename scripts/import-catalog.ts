/**
 * Importador de catálogo ONISTORE (CSV o XLSX).
 *
 *   tsx scripts/import-catalog.ts <archivo.csv|xlsx>            → dry-run (solo reporte)
 *   tsx scripts/import-catalog.ts <archivo.csv|xlsx> --commit   → valida y escribe en la BD
 *
 * Columnas: sku,name,slug,category,subcategory,price,oldPrice,stock,tags,
 *           condition,description,seoTitle,seoDescription,imageName,
 *           featured,isNew,isChancadito,isPreorder,isSoldOut
 */
import { existsSync } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { slugify, CONDITIONS } from "../src/lib/utils";

const prisma = new PrismaClient();

const FILE = process.argv[2];
const COMMIT = process.argv.includes("--commit");

const bool = (v: unknown) =>
  ["true", "1", "si", "sí", "x", "yes", "y"].includes(String(v ?? "").trim().toLowerCase());
const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
};
const str = (v: unknown) => String(v ?? "").trim();

type Row = Record<string, unknown>;
type Issue = { row: number; field: string; msg: string };

async function main() {
  if (!FILE) {
    console.error("Uso: tsx scripts/import-catalog.ts <archivo.csv|xlsx> [--commit]");
    process.exit(1);
  }
  const wb = XLSX.readFile(path.resolve(FILE));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });
  // normaliza claves a lowercase
  const data = rows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim().toLowerCase(), v]))
  );

  const categories = await prisma.category.findMany();
  const catBy = new Map<string, string>();
  categories.forEach((c) => {
    catBy.set(c.name.toLowerCase(), c.id);
    catBy.set(c.slug.toLowerCase(), c.id);
  });
  const existingSkus = new Set((await prisma.product.findMany({ where: { sku: { not: null } }, select: { sku: true } })).map((p) => p.sku));
  const existingSlugs = new Set((await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug));

  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const seenSku = new Set<string>();
  const seenSlug = new Set<string>();
  const prepared: {
    rowNum: number;
    slug: string;
    data: Record<string, unknown>;
    tags: string[];
    image: string | null;
  }[] = [];

  data.forEach((r, i) => {
    const rowNum = i + 2; // +2: fila 1 = header
    const name = str(r.name);
    if (!name) {
      errors.push({ row: rowNum, field: "name", msg: "nombre vacío" });
      return;
    }
    if (name !== name.replace(/\s+/g, " ").trim())
      warnings.push({ row: rowNum, field: "name", msg: "nombre con espacios irregulares" });

    // categoría
    const catRaw = str(r.category);
    const categoryId = catBy.get(catRaw.toLowerCase());
    if (!categoryId)
      errors.push({ row: rowNum, field: "category", msg: `categoría no reconocida: "${catRaw}" (válidas: ${categories.map((c) => c.name).join(", ")})` });

    // precio / oferta
    const price = num(r.price);
    const oldPrice = str(r.oldprice) ? num(r.oldprice) : NaN;
    if (!price || price <= 0) errors.push({ row: rowNum, field: "price", msg: "precio vacío o inválido" });
    let priceCents = Math.round(price * 100);
    let discountCents: number | null = null;
    if (Number.isFinite(oldPrice) && oldPrice > price) {
      priceCents = Math.round(oldPrice * 100);
      discountCents = Math.round(price * 100);
    }

    // condición
    const isPreorder = bool(r.ispreorder);
    let condition = str(r.condition).toUpperCase() || "NUEVO";
    if (isPreorder) condition = "PREORDER";
    if (!CONDITIONS.includes(condition as (typeof CONDITIONS)[number]))
      errors.push({ row: rowNum, field: "condition", msg: `condición inválida: "${condition}"` });

    // sku
    const sku = str(r.sku) || null;
    if (!sku) warnings.push({ row: rowNum, field: "sku", msg: "SKU faltante" });
    if (sku) {
      if (seenSku.has(sku.toLowerCase())) errors.push({ row: rowNum, field: "sku", msg: `SKU duplicado en el archivo: ${sku}` });
      seenSku.add(sku.toLowerCase());
      if (existingSkus.has(sku)) warnings.push({ row: rowNum, field: "sku", msg: `SKU ya existe en BD (se actualizará): ${sku}` });
    }

    // slug
    const slug = str(r.slug) || slugify(name);
    if (seenSlug.has(slug)) {
      errors.push({ row: rowNum, field: "slug", msg: `slug duplicado en el archivo: ${slug}` });
    }
    seenSlug.add(slug);
    if (existingSlugs.has(slug)) warnings.push({ row: rowNum, field: "slug", msg: `slug ya existe en BD (se actualizará): ${slug}` });

    // imagen
    let image: string | null = null;
    const imageName = str(r.imagename);
    if (imageName) {
      if (existsSync(path.join(process.cwd(), "public", "uploads", imageName))) image = `/uploads/${imageName}`;
      else warnings.push({ row: rowNum, field: "imageName", msg: `imagen no encontrada en /public/uploads: ${imageName}` });
    } else {
      warnings.push({ row: rowNum, field: "imageName", msg: "sin imagen (se mostrará 'Foto pronto')" });
    }

    const isSoldOut = bool(r.issoldout);
    const stock = isSoldOut ? 0 : Math.max(0, Math.round(num(r.stock) || 0));
    const tags = str(r.tags).split(/[;,]/).map((t) => t.trim()).filter(Boolean);

    prepared.push({
      rowNum,
      slug,
      tags,
      image,
      data: {
        name: name.replace(/\s+/g, " ").trim(),
        slug,
        sku,
        subcategory: str(r.subcategory) || null,
        seoTitle: str(r.seotitle) || null,
        seoDescription: str(r.seodescription) || null,
        description: str(r.description),
        priceCents,
        discountCents,
        condition,
        stock,
        featured: bool(r.featured),
        isNew: bool(r.isnew),
        isChancadito: bool(r.ischancadito),
        active: true,
        categoryId: categoryId ?? null,
      },
    });
  });

  // ---- Reporte ----
  console.log(`\n📋 Filas leídas: ${data.length}`);
  console.log(`✅ Listas: ${prepared.length}  |  ❌ Errores: ${errors.length}  |  ⚠️  Avisos: ${warnings.length}\n`);
  if (errors.length) {
    console.log("❌ ERRORES (bloquean la importación):");
    errors.forEach((e) => console.log(`   fila ${e.row} · ${e.field}: ${e.msg}`));
    console.log("");
  }
  if (warnings.length) {
    console.log("⚠️  AVISOS (no bloquean):");
    warnings.slice(0, 40).forEach((w) => console.log(`   fila ${w.row} · ${w.field}: ${w.msg}`));
    if (warnings.length > 40) console.log(`   ...y ${warnings.length - 40} más`);
    console.log("");
  }

  if (!COMMIT) {
    console.log("🧪 DRY-RUN. No se escribió nada. Corre con --commit para importar (si no hay errores).");
    return;
  }
  if (errors.length) {
    console.log("⛔ Hay errores: corrige el archivo y vuelve a correr. No se importó nada.");
    process.exit(1);
  }

  // ---- Commit (upsert por slug) ----
  let ok = 0;
  for (const p of prepared) {
    const { categoryId, ...scalar } = p.data as Record<string, unknown> & { categoryId: string };
    // tags
    const tagConnect = [];
    for (const t of p.tags) {
      const tslug = slugify(t);
      const tag = await prisma.tag.upsert({ where: { slug: tslug }, update: {}, create: { slug: tslug, name: t } });
      tagConnect.push(tag.id);
    }
    const base = { ...scalar, category: { connect: { id: categoryId } } };
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: base });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      if (p.image) await prisma.productImage.create({ data: { productId: existing.id, url: p.image, order: 0 } });
      await prisma.productTag.deleteMany({ where: { productId: existing.id } });
      if (tagConnect.length) await prisma.productTag.createMany({ data: tagConnect.map((tagId) => ({ productId: existing.id, tagId })) });
    } else {
      await prisma.product.create({
        data: {
          ...base,
          images: p.image ? { create: [{ url: p.image, order: 0 }] } : undefined,
          tags: tagConnect.length ? { create: tagConnect.map((tagId) => ({ tagId })) } : undefined,
        },
      });
    }
    ok++;
  }
  console.log(`\n✅ Importados/actualizados: ${ok} productos.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
