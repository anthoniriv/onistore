import type { Metadata } from "next";
import Link from "next/link";
import { Swords, BookOpen, Sparkles, Bookmark } from "lucide-react";
import { OniMark } from "@/components/brand";

export const metadata: Metadata = { title: "Nosotros" };

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-col items-center text-center">
        <OniMark className="h-20 w-20" />
        <p className="mt-3 font-jp text-sm text-oni-gold">鬼 · 本物の魂</p>
        <h1 className="mt-1 font-display text-4xl text-oni-bone sm:text-5xl">¿Quiénes somos?</h1>
      </div>

      <div className="mt-6 space-y-4 text-center text-oni-ash">
        <p>
          Somos <b className="text-oni-bone">ONISTORE</b>, tu tienda otaku de confianza. Apasionados por el anime, el
          manga y la cultura japonesa.
        </p>
        <p>
          Traemos para ti los mejores productos con <b className="text-oni-bone">calidad, variedad y buen precio</b>. Desde
          figuras de tus personajes favoritos hasta manga, Blu-ray y merch para todo fan.
        </p>
      </div>

      <h2 className="mt-10 text-center font-display text-2xl text-oni-bone">¿Qué vendemos?</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Swords, t: "Figuras", s: "Tus personajes favoritos" },
          { icon: BookOpen, t: "Manga", s: "Historias que inspiran" },
          { icon: Sparkles, t: "Anime Goods", s: "Llaveros, posters y más" },
          { icon: Bookmark, t: "Bookarts", s: "Marcadores y detalles" },
        ].map((c) => (
          <div key={c.t} className="rounded-oni border border-oni-line bg-oni-ink p-4 text-center">
            <c.icon className="mx-auto h-8 w-8 text-oni-red" />
            <p className="mt-2 font-display text-lg text-oni-bone">{c.t}</p>
            <p className="text-xs text-oni-ash">{c.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { t: "Online", s: "WhatsApp, Instagram y TikTok" },
          { t: "Entregas", s: "Fines de semana en Arenales y Centro Cívico" },
          { t: "Envíos", s: "A todo el Perú, costo según destino" },
        ].map((c) => (
          <div key={c.t} className="rounded-oni border border-oni-line bg-oni-surface p-4">
            <p className="font-display text-lg text-oni-red">{c.t}</p>
            <p className="text-sm text-oni-ash">{c.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/catalogo" className="inline-block rounded-md bg-oni-red px-6 py-3 font-display tracking-wide text-white hover:bg-oni-red-dark">
          Explorar catálogo
        </Link>
      </div>
    </div>
  );
}
