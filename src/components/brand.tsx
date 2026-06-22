import { cn } from "@/lib/utils";

/** Máscara Oni (hannya) — ícono oficial de la marca (PNG transparente) */
export function OniMark({ className, title = "ONISTORE" }: { className?: string; title?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/oni-icon.png"
      alt={title}
      className={cn("h-8 w-8 shrink-0 object-contain", className)}
    />
  );
}

/** Logo horizontal: ícono + wordmark "ONISTORE" en la tipografía display (Oxanium) */
export function OniLogo({
  className,
  markClassName,
  showText = true,
}: {
  className?: string;
  markClassName?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <OniMark className={cn("h-9 w-9", markClassName)} />
      {showText && (
        <span className="font-display text-xl font-extrabold leading-none tracking-[0.06em] text-oni-bone">
          ONISTORE
          <span className="text-oni-red">:</span>
        </span>
      )}
    </span>
  );
}
