import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Truck, ShieldCheck, Store, Tag, Bell, CalendarClock } from "lucide-react";
import { getProductBySlug, getRelated } from "@/lib/queries";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { Price } from "@/components/price";
import { ConditionBadge } from "@/components/badges";
import { BadgeRow } from "@/components/badges";
import { SectionHeader, ProductRail } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { getBadges, getProductState, primaryCta } from "@/lib/card-state";
import { waStock, waChancadito, waPreorder, waSoldOut, type WaProduct } from "@/lib/whatsapp";
import { SITE_NAME, SITE_URL, productUrl } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Producto no encontrado" };
  const title = p.seoTitle || `${p.name}${p.anime ? ` — ${p.anime}` : ""}`;
  const description =
    p.seoDescription ||
    p.description ||
    `Compra ${p.name} en ${SITE_NAME}. ${p.category.name} de anime y manga. Envíos a todo el Perú y recojo en Arenales.`;
  const image = p.images[0]?.url || "/brand/oni-icon.png";
  return {
    title,
    description,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: { title, description, url: productUrl(slug), type: "website", images: [{ url: image, alt: p.name }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = await getRelated(p.categoryId, p.id, 8);
  const state = getProductState(p);
  const cta = primaryCta(p);
  const badges = getBadges(p, 3);
  const price = p.discountCents ?? p.priceCents;

  const wa: WaProduct = {
    name: p.name,
    slug: p.slug,
    priceCents: p.priceCents,
    discountCents: p.discountCents,
    category: p.category.name,
    sku: p.sku,
  };
  const consultHref = p.isChancadito ? waChancadito(wa) : waStock(wa);

  const availability = state.isPreorder
    ? "https://schema.org/PreOrder"
    : state.soldOut
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.seoDescription || p.description || p.name,
    image: p.images.map((i) => (i.url.startsWith("http") ? i.url : `${SITE_URL}${i.url}`)),
    sku: p.sku || undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    category: p.category.name,
    offers: {
      "@type": "Offer",
      url: productUrl(p.slug),
      priceCurrency: "PEN",
      price: (price / 100).toFixed(2),
      availability,
      itemCondition:
        p.condition === "USADO" || p.condition === "SEMINUEVO"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: p.category.name, item: `${SITE_URL}/catalogo?category=${p.category.slug}` },
      { "@type": "ListItem", position: 3, name: p.name, item: productUrl(p.slug) },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Migas" className="mb-4 text-xs text-oni-ash">
        <Link href="/" className="hover:text-oni-red">Inicio</Link> /{" "}
        <Link href={`/catalogo?category=${p.category.slug}`} className="hover:text-oni-red">{p.category.name}</Link> /{" "}
        <span className="text-oni-bone">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery images={p.images} name={p.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={p.condition} />
            <BadgeRow badges={badges.filter((b) => b.kind !== "condicion")} />
          </div>

          {p.anime && <p className="mt-3 text-sm uppercase tracking-wide text-oni-ash">{p.anime}</p>}
          <h1 className="mt-1 font-display text-3xl leading-tight text-oni-bone sm:text-4xl">{p.name}</h1>

          <div className="mt-4">
            <Price priceCents={p.priceCents} discountCents={p.discountCents} size="lg" />
          </div>

          {/* Estado de stock */}
          <p className="mt-2 text-sm font-semibold">
            {state.isPreorder ? (
              <span className="text-oni-red-soft">🗓️ Disponible en preventa</span>
            ) : state.soldOut ? (
              <span className="text-oni-ash">Agotado por ahora</span>
            ) : state.lowStock ? (
              <span className="text-oni-red-soft">¡Últimas {p.stock} unidades!</span>
            ) : (
              <span className="text-oni-success">En stock</span>
            )}
          </p>

          {p.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.genres.map(({ genre }) => (
                <Link key={genre.slug} href={`/catalogo?genre=${genre.slug}`} className="rounded-full border border-oni-line px-2.5 py-1 text-xs text-oni-ash hover:border-oni-red hover:text-oni-bone">
                  {genre.name}
                </Link>
              ))}
            </div>
          )}

          {p.isChancadito && p.chancaditoReason && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-oni-stone/30 bg-oni-surface p-3 text-sm">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-oni-stone" />
              <span className="text-oni-bone"><b>Detalle outlet:</b> {p.chancaditoReason}</span>
            </div>
          )}

          {/* CTA por estado */}
          <div className="mt-6 space-y-3">
            {cta === "cart" && (
              <AddToCart
                product={{ id: p.id, slug: p.slug, name: p.name, priceCents: price, image: p.images[0]?.url, stock: p.stock }}
                variant="full"
              />
            )}
            {cta === "preorder" && (
              <a href={waPreorder(wa)} target="_blank" rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark">
                <CalendarClock className="h-5 w-5" /> Reservar en preventa
              </a>
            )}
            {cta === "soldout" && (
              <a href={waSoldOut(wa)} target="_blank" rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark">
                <Bell className="h-5 w-5" /> Avísame cuando llegue
              </a>
            )}

            <a href={consultHref} target="_blank" rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-[#25D366] font-semibold text-[#25D366] hover:bg-[#25D366] hover:text-white">
              <WhatsAppIcon className="h-5 w-5" /> {p.isChancadito ? "Consultar este chancadito" : "Consultar por WhatsApp"}
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 text-xs text-oni-ash sm:grid-cols-3">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-oni-red" /> Envíos a todo el Perú</span>
            <span className="flex items-center gap-2"><Store className="h-4 w-4 text-oni-red" /> Recojo en Arenales</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-oni-red" /> Producto garantizado</span>
          </div>

          {p.description && (
            <div className="mt-6 border-t border-oni-line pt-5">
              <h2 className="mb-2 font-display text-lg text-oni-bone">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-oni-ash">{p.description}</p>
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-y-2 border-t border-oni-line pt-5 text-sm">
            {p.brand && (<><dt className="text-oni-ash">Marca</dt><dd className="text-oni-bone">{p.brand}</dd></>)}
            {p.sku && (<><dt className="text-oni-ash">SKU</dt><dd className="text-oni-bone">{p.sku}</dd></>)}
            <dt className="text-oni-ash">Categoría</dt><dd className="text-oni-bone">{p.category.name}</dd>
            {p.subcategory && (<><dt className="text-oni-ash">Subcategoría</dt><dd className="text-oni-bone">{p.subcategory}</dd></>)}
            <dt className="text-oni-ash">Disponibilidad</dt>
            <dd className="text-oni-bone">{state.isPreorder ? "Preventa" : state.soldOut ? "Agotado" : `${p.stock} en stock`}</dd>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="También te puede gustar" href={`/catalogo?category=${p.category.slug}`} />
          <ProductRail products={related} />
        </section>
      )}
    </div>
  );
}
