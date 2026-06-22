import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard, type CardProduct } from "./product-card";

export function SectionHeader({
  title,
  href,
  kicker,
}: {
  title: string;
  href?: string;
  kicker?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {kicker && <p className="text-xs font-semibold uppercase tracking-widest text-oni-gold">{kicker}</p>}
        <h2 className="font-display text-2xl leading-none text-oni-bone sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-oni-red hover:text-oni-red-soft">
          Ver todo <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function ProductGrid({ products }: { products: CardProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

/** Carrusel horizontal (mobile-first) de productos para secciones de home */
export function ProductRail({ products }: { products: CardProduct[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {products.map((p) => (
        <div key={p.id} className="w-40 shrink-0 sm:w-52">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
