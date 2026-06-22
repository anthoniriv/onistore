"use client";

import { Menu, X, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { OniLogo } from "./brand";
import { useIsClient } from "@/lib/use-is-client";

type Cat = { slug: string; name: string };

export function MobileMenu({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const close = () => setOpen(false);

  return (
    <>
      <button
        aria-label="Menú"
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-md text-oni-bone hover:text-oni-red md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <nav className="absolute left-0 top-0 h-full w-[82%] max-w-xs overflow-y-auto border-r border-oni-line bg-oni-ink p-4 animate-fade">
            <div className="flex items-center justify-between">
              <OniLogo />
              <button aria-label="Cerrar" onClick={close} className="grid h-9 w-9 place-items-center text-oni-ash">
                <X className="h-6 w-6" />
              </button>
            </div>

            <Link
              href="/chancaditos"
              onClick={close}
              className="mt-5 flex items-center gap-2 rounded-md bg-oni-red px-4 py-3 font-display text-lg text-white"
            >
              <Flame className="h-5 w-5" /> Zona Chancaditos
            </Link>

            <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-oni-ash">Categorías</p>
            <div className="mt-2 flex flex-col">
              <Link href="/catalogo" onClick={close} className="flex items-center justify-between border-b border-oni-line py-3 text-oni-bone">
                Todo el catálogo <ChevronRight className="h-4 w-4 text-oni-ash" />
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalogo?category=${c.slug}`}
                  onClick={close}
                  className="flex items-center justify-between border-b border-oni-line py-3 text-oni-bone"
                >
                  {c.name} <ChevronRight className="h-4 w-4 text-oni-ash" />
                </Link>
              ))}
            </div>

            <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-widest text-oni-ash">Más</p>
            <div className="mt-2 flex flex-col">
              <Link href="/contacto" onClick={close} className="border-b border-oni-line py-3 text-oni-bone">
                Contacto
              </Link>
              <Link href="/nosotros" onClick={close} className="border-b border-oni-line py-3 text-oni-bone">
                Nosotros
              </Link>
            </div>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}
