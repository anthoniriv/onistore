import { formatPrice, cn } from "@/lib/utils";

export function Price({
  priceCents,
  discountCents,
  className,
  size = "md",
}: {
  priceCents: number;
  discountCents?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const hasDiscount = discountCents != null && discountCents < priceCents;
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];

  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold text-oni-bone", sizes)}>
        {formatPrice(hasDiscount ? discountCents! : priceCents)}
      </span>
      {hasDiscount && (
        <span className={cn("text-oni-ash line-through", size === "lg" ? "text-base" : "text-xs")}>
          {formatPrice(priceCents)}
        </span>
      )}
    </span>
  );
}

export function discountPercent(priceCents: number, discountCents?: number | null) {
  if (discountCents == null || discountCents >= priceCents) return 0;
  return Math.round((1 - discountCents / priceCents) * 100);
}
