import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { AddToCart } from "./add-to-cart";
import { BadgeRow } from "./badges";
import { Price } from "./price";
import { OniMark } from "./brand";
import { WhatsAppIcon } from "./icons";
import { getBadges, getProductState, primaryCta } from "@/lib/card-state";
import { waPreorder, waSoldOut } from "@/lib/whatsapp";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  anime: string | null;
  sku: string | null;
  priceCents: number;
  discountCents: number | null;
  condition: string;
  stock: number;
  isChancadito: boolean;
  isNew: boolean;
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string };
};

export function ProductCard({ product }: { product: CardProduct }) {
  const img = product.images[0]?.url;
  const isSvg = !!img && img.endsWith(".svg");
  const state = getProductState(product);
  const badges = getBadges(product);
  const cta = primaryCta(product);
  const kicker = product.anime || product.category.name;
  const wa = { name: product.name, slug: product.slug, priceCents: product.priceCents, discountCents: product.discountCents, category: product.category.name, sku: product.sku };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-oni border border-oni-line bg-oni-ink transition-colors hover:border-oni-red/60">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-oni-surface">
        {img ? (
          <Image
            src={img}
            alt={product.images[0]?.alt || `${product.name} — ${product.category.name} ONISTORE`}
            fill
            unoptimized={isSvg}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-oni-ash">
            <OniMark className="h-12 w-12 opacity-40" />
            <span className="text-[11px] uppercase tracking-widest">Foto pronto</span>
          </div>
        )}

        {badges.length > 0 && <BadgeRow badges={badges} className="absolute inset-x-2 top-2" />}

        {state.soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-oni-black/65">
            <span className="rotate-[-8deg] border-2 border-oni-bone px-3 py-1 font-display text-lg text-oni-bone">Agotado</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-1 text-[11px] uppercase tracking-wide text-oni-ash">{kicker}</p>
        <Link href={`/producto/${product.slug}`} className="line-clamp-2 text-sm font-medium text-oni-bone hover:text-oni-red">
          {product.name}
        </Link>

        {/* Stock / urgencia */}
        {state.isPreorder ? (
          <p className="mt-1 text-[11px] font-semibold text-oni-red">🗓️ En preventa</p>
        ) : state.lowStock ? (
          <p className="mt-1 text-[11px] font-semibold text-oni-red">¡Últimas {product.stock} unidades!</p>
        ) : state.soldOut ? (
          <p className="mt-1 text-[11px] text-oni-ash">Sin stock</p>
        ) : (
          <p className="mt-1 text-[11px] text-oni-ash">Disponible</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price priceCents={product.priceCents} discountCents={product.discountCents} />

          {cta === "cart" && (
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.discountCents ?? product.priceCents,
                image: img,
                stock: product.stock,
              }}
            />
          )}
          {cta === "preorder" && (
            <a
              href={waPreorder(wa)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reservar en preventa por WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-md bg-[#25D366] text-white transition-transform hover:scale-105"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          )}
          {cta === "soldout" && (
            <a
              href={waSoldOut(wa)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Avísame cuando llegue (WhatsApp)"
              className="grid h-9 w-9 place-items-center rounded-md border border-oni-line text-oni-bone transition-colors hover:border-oni-red hover:text-oni-red"
            >
              <Bell className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
