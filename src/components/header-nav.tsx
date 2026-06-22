"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Cat = { slug: string; name: string };

export function HeaderNav({ categories }: { categories: Cat[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const activeCat = pathname === "/catalogo" ? sp.get("category") : null;
  const onChancaditos = pathname.startsWith("/chancaditos");

  return (
    <nav className="ml-auto hidden items-center gap-5 text-sm font-medium md:flex">
      {categories.slice(0, 5).map((c) => (
        <Link
          key={c.slug}
          href={`/catalogo?category=${c.slug}`}
          aria-current={activeCat === c.slug ? "page" : undefined}
          className={cn(
            "border-b-2 pb-0.5 transition-colors hover:text-oni-red",
            activeCat === c.slug ? "border-oni-red text-oni-red" : "border-transparent text-oni-bone"
          )}
        >
          {c.name}
        </Link>
      ))}
      <Link
        href="/chancaditos"
        className={cn(
          "flex items-center gap-1 font-semibold hover:text-oni-red-soft",
          onChancaditos ? "text-oni-red-soft" : "text-oni-red"
        )}
      >
        <Flame className="h-4 w-4" /> Chancaditos
      </Link>
    </nav>
  );
}
