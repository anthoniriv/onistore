import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Carrito", href: "/carrito" },
  { n: 2, label: "Checkout", href: "/checkout" },
  { n: 3, label: "Listo", href: null as string | null },
];

/** Stepper Carrito → Checkout → Listo. current = 1 | 2 | 3 */
export function CheckoutStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Progreso del pedido" className="mb-6">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const done = s.n < current;
          const active = s.n === current;
          const Circle = (
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors",
                done
                  ? "border-oni-red bg-oni-red text-white"
                  : active
                    ? "border-oni-red text-oni-red"
                    : "border-oni-line text-oni-ash"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : s.n}
            </span>
          );
          return (
            <li key={s.n} className="flex items-center gap-2 sm:gap-4">
              {done && s.href ? (
                <Link href={s.href} className="flex items-center gap-2 hover:opacity-80">
                  {Circle}
                  <span className="hidden text-sm font-medium text-oni-bone sm:inline">{s.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-2">
                  {Circle}
                  <span className={cn("hidden text-sm font-medium sm:inline", active ? "text-oni-bone" : "text-oni-ash")}>
                    {s.label}
                  </span>
                </span>
              )}
              {i < STEPS.length - 1 && <span className={cn("h-px w-6 sm:w-12", s.n < current ? "bg-oni-red" : "bg-oni-line")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
