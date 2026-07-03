"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CONDITION_LABEL } from "@/lib/utils";

type Named = { slug: string; name: string };

/** Fila de filtros activos removibles, arriba de los resultados. */
export function ActiveFilters({
  categories,
  tags,
  genres,
  brands,
  hideChancaditos,
}: {
  categories: Named[];
  tags: Named[];
  genres: Named[];
  brands: string[];
  hideChancaditos?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const nameOf = (list: Named[], slug: string) => list.find((x) => x.slug === slug)?.name ?? slug;

  const chips: { key: string; label: string }[] = [];
  const cat = sp.get("category");
  if (cat) chips.push({ key: "category", label: nameOf(categories, cat) });
  const cond = sp.get("condition");
  if (cond) chips.push({ key: "condition", label: CONDITION_LABEL[cond] ?? cond });
  const tag = sp.get("tag");
  if (tag) chips.push({ key: "tag", label: nameOf(tags, tag) });
  const genre = sp.get("genre");
  if (genre) chips.push({ key: "genre", label: nameOf(genres, genre) });
  const brand = sp.get("brand");
  if (brand && brands.includes(brand)) chips.push({ key: "brand", label: brand });
  const min = sp.get("min");
  const max = sp.get("max");
  if (min || max) chips.push({ key: "__price", label: `S/ ${min || "0"}–${max || "∞"}` });
  if (sp.get("oferta") === "1") chips.push({ key: "oferta", label: "En oferta" });
  const av = sp.get("availability");
  if (av) chips.push({ key: "availability", label: av === "instock" ? "En stock" : "Preventa" });
  if (!hideChancaditos && sp.get("chancaditos") === "1") chips.push({ key: "chancaditos", label: "🔥 Chancaditos" });

  if (!chips.length) return null;

  const remove = (key: string) => {
    const params = new URLSearchParams(sp.toString());
    if (key === "__price") {
      params.delete("min");
      params.delete("max");
    } else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const keep = new URLSearchParams();
    const q = sp.get("q");
    if (q) keep.set("q", q);
    router.push(`?${keep.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-oni-ash">Filtros:</span>
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => remove(c.key)}
          aria-label={`Quitar filtro ${c.label}`}
          className="flex items-center gap-1 rounded-full border border-oni-red/50 bg-oni-red/10 px-3 py-1 text-xs text-oni-bone transition-colors hover:border-oni-red hover:bg-oni-red/20"
        >
          {c.label} <X className="h-3 w-3" />
        </button>
      ))}
      {chips.length > 1 && (
        <button onClick={clearAll} className="text-xs text-oni-ash underline hover:text-oni-red-soft">
          Limpiar todo
        </button>
      )}
    </div>
  );
}
