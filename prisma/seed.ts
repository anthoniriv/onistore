import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GENRES } from "./seed-genres";

const prisma = new PrismaClient();

const ph = (n: number) => `/placeholders/p${((n - 1) % 6) + 1}.svg`;

async function main() {
  console.log("🌱 Seeding ONISTORE...");

  // Limpieza
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productGenre.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.message.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.adminUser.deleteMany();

  // Categorías
  const cats = await Promise.all(
    [
      { slug: "figuras", name: "Figuras", icon: "Swords", order: 1 },
      { slug: "manga", name: "Manga", icon: "BookOpen", order: 2 },
      { slug: "blu-ray", name: "Blu-ray", icon: "Disc", order: 3 },
      { slug: "anime-goods", name: "Anime Goods", icon: "Sparkles", order: 4 },
      { slug: "bookarts", name: "Bookarts", icon: "Bookmark", order: 5 },
    ].map((c) => prisma.category.create({ data: c }))
  );
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;

  // Tags (animes)
  const tagData = [
    { slug: "jujutsu-kaisen", name: "Jujutsu Kaisen" },
    { slug: "haikyuu", name: "Haikyuu!!" },
    { slug: "demon-slayer", name: "Demon Slayer" },
    { slug: "one-piece", name: "One Piece" },
    { slug: "chainsaw-man", name: "Chainsaw Man" },
    { slug: "naruto", name: "Naruto" },
  ];
  const tags = await Promise.all(tagData.map((t) => prisma.tag.create({ data: t })));
  const tag = (slug: string) => tags.find((t) => t.slug === slug)!.id;

  // Géneros / demografías
  await Promise.all(GENRES.map((g, i) => prisma.genre.create({ data: { ...g, order: i } })));

  type P = {
    name: string;
    cat: string;
    price: number;
    discount?: number;
    condition?: string;
    anime?: string;
    brand?: string;
    stock?: number;
    featured?: boolean;
    chancadito?: boolean;
    reason?: string;
    tag?: string;
    desc?: string;
  };

  const products: P[] = [
    { name: "Figura Gojo Satoru — Jujutsu Kaisen", cat: "figuras", price: 18990, condition: "NUEVO", anime: "Jujutsu Kaisen", brand: "Banpresto", stock: 8, featured: true, tag: "jujutsu-kaisen", desc: "Figura de PVC 18cm, edición Hidden Inventory. Caja sellada." },
    { name: "Figura Hinata Shoyo — Haikyuu!!", cat: "figuras", price: 15990, condition: "NUEVO", anime: "Haikyuu!!", brand: "Banpresto", stock: 5, featured: true, tag: "haikyuu", desc: "Figura escala 1/8, pose de salto. 17cm." },
    { name: "Figura Tanjiro Kamado — Demon Slayer", cat: "figuras", price: 16990, condition: "NUEVO", anime: "Demon Slayer", brand: "Aniplex", stock: 6, tag: "demon-slayer", desc: "Figura con efecto de agua, base incluida." },
    { name: "Manga Jujutsu Kaisen Vol. 1", cat: "manga", price: 2990, condition: "NUEVO", anime: "Jujutsu Kaisen", stock: 20, featured: true, tag: "jujutsu-kaisen", desc: "Edición español, Panini. Tapa blanda." },
    { name: "Manga One Piece Vol. 100", cat: "manga", price: 3290, condition: "NUEVO", anime: "One Piece", stock: 15, tag: "one-piece", desc: "Volumen especial aniversario." },
    { name: "Manga Chainsaw Man Vol. 5", cat: "manga", price: 2990, condition: "SEMINUEVO", anime: "Chainsaw Man", stock: 3, tag: "chainsaw-man", desc: "Leído una vez, excelente estado." },
    { name: "Blu-ray Demon Slayer: Mugen Train", cat: "blu-ray", price: 8990, condition: "NUEVO", anime: "Demon Slayer", stock: 4, featured: true, tag: "demon-slayer", desc: "Edición limitada con artbook. Audio japonés + subs." },
    { name: "Blu-ray Jujutsu Kaisen 0 The Movie", cat: "blu-ray", price: 9990, condition: "NUEVO", anime: "Jujutsu Kaisen", stock: 3, tag: "jujutsu-kaisen", desc: "Película completa, región libre." },
    { name: "Llavero Acrílico Nobara", cat: "anime-goods", price: 1290, condition: "NUEVO", anime: "Jujutsu Kaisen", stock: 30, tag: "jujutsu-kaisen", desc: "Acrílico doble cara 6cm." },
    { name: "Poster Haikyuu Karasuno", cat: "anime-goods", price: 1990, condition: "NUEVO", anime: "Haikyuu!!", stock: 12, tag: "haikyuu", desc: "Poster A3 papel couché 300g." },
    { name: "Set 5 Stickers Naruto", cat: "anime-goods", price: 990, condition: "NUEVO", anime: "Naruto", stock: 40, tag: "naruto", desc: "Stickers resistentes al agua." },
    { name: "Marcapáginas Bookart Demon Slayer", cat: "bookarts", price: 1490, condition: "NUEVO", anime: "Demon Slayer", stock: 25, tag: "demon-slayer", desc: "Bookart hecho a mano con borlas." },
    // Chancaditos
    { name: "Figura Luffy Gear 5 (caja con detalle)", cat: "figuras", price: 22990, discount: 16990, condition: "NUEVO", anime: "One Piece", brand: "Bandai", stock: 1, chancadito: true, reason: "Caja con golpe leve, figura impecable", tag: "one-piece", desc: "Producto outlet: la figura está perfecta, solo la caja tiene un detalle." },
    { name: "Manga Naruto Vol. 3 (usado)", cat: "manga", price: 2990, discount: 1490, condition: "USADO", anime: "Naruto", stock: 2, chancadito: true, reason: "Lomo con desgaste", tag: "naruto", desc: "Buen estado de lectura, precio rebajado." },
    { name: "Poster Chainsaw Man (con doblez)", cat: "anime-goods", price: 1990, discount: 990, condition: "SEMINUEVO", anime: "Chainsaw Man", stock: 1, chancadito: true, reason: "Pequeño doblez en esquina", tag: "chainsaw-man", desc: "Outlet, ideal para enmarcar." },
  ];

  let i = 1;
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        slug: p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + i,
        name: p.name,
        description: p.desc || "",
        anime: p.anime,
        brand: p.brand,
        priceCents: p.price,
        discountCents: p.discount,
        condition: p.condition || "NUEVO",
        stock: p.stock ?? 5,
        featured: p.featured ?? false,
        isChancadito: p.chancadito ?? false,
        chancaditoReason: p.reason,
        categoryId: cat(p.cat),
        images: { create: [{ url: ph(i), order: 0, alt: p.name }] },
        tags: p.tag ? { create: [{ tagId: tag(p.tag) }] } : undefined,
      },
    });
    void created;
    i++;
  }

  // Banners (hero slider)
  await prisma.banner.createMany({
    data: [
      { title: "Despierta tu lado ONI", subtitle: "Figuras, manga y Blu-ray de tus animes favoritos", imageUrl: "/placeholders/hero1.svg", ctaText: "Ver catálogo", ctaHref: "/catalogo", order: 1 },
      { title: "Zona Chancaditos", subtitle: "Outlet con detalles, precios de demonio 🔥", imageUrl: "/placeholders/hero2.svg", ctaText: "Ver ofertas", ctaHref: "/chancaditos", order: 2 },
      { title: "LIVE ONISTORE", subtitle: "Viernes a Domingo 7-9PM · Sorteos y drops", imageUrl: "/placeholders/hero3.svg", ctaText: "Únete por WhatsApp", ctaHref: "/contacto", order: 3 },
    ],
  });

  // Cupones demo
  await prisma.coupon.createMany({
    data: [
      { code: "BIENVENIDO10", type: "PERCENT", value: 10, minSubtotalCents: 0, active: true },
      { code: "ONI20", type: "PERCENT", value: 20, minSubtotalCents: 10000, active: true },
      { code: "ENVIOGRATIS", type: "FIXED", value: 1000, minSubtotalCents: 5000, active: true },
    ],
  });

  // Admin
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "onistore123", 10);
  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@onistore.pe",
      passwordHash: hash,
      name: "Admin Onistore",
    },
  });

  console.log(`✅ ${products.length} productos, ${cats.length} categorías, 3 banners, 1 admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
