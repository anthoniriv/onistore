"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { CONDITIONS, CONDITION_LABEL, cn } from "@/lib/utils";

type Cat = { slug: string; name: string };
type Tag = { slug: string; name: string };
type Genre = { slug: string; name: string; kind: string };

const SORTS = [
  { v: "nuevo", l: "Más nuevos" },
  { v: "precio-asc", l: "Precio: menor a mayor" },
  { v: "precio-desc", l: "Precio: mayor a menor" },
  { v: "nombre", l: "Nombre A–Z" },
];

const AVAILABILITY = [
  { v: "instock", l: "En stock" },
  { v: "preorder", l: "Preventa" },
];

export function CatalogFilters({
  categories,
  tags,
  genres = [],
  brands = [],
  hideChancaditos,
}: {
  categories: Cat[];
  tags: Tag[];
  genres?: Genre[];
  brands?: string[];
  hideChancaditos?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  const current = useMemo(
    () => ({
      category: sp.get("category") ?? "",
      condition: sp.get("condition") ?? "",
      tag: sp.get("tag") ?? "",
      genre: sp.get("genre") ?? "",
      brand: sp.get("brand") ?? "",
      oferta: sp.get("oferta") === "1",
      availability: sp.get("availability") ?? "",
      min: sp.get("min") ?? "",
      max: sp.get("max") ?? "",
      chancaditos: sp.get("chancaditos") === "1",
      sort: sp.get("sort") ?? "nuevo",
    }),
    [sp]
  );

  const shownTags = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    return q ? tags.filter((t) => t.name.toLowerCase().includes(q)) : tags;
  }, [tags, tagQuery]);

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    const keep = new URLSearchParams();
    const q = sp.get("q");
    if (q) keep.set("q", q);
    router.push(`?${keep.toString()}`, { scroll: false });
    setOpen(false);
  }

  const activeCount =
    (current.category ? 1 : 0) +
    (current.condition ? 1 : 0) +
    (current.tag ? 1 : 0) +
    (current.genre ? 1 : 0) +
    (current.brand ? 1 : 0) +
    (current.oferta ? 1 : 0) +
    (current.availability ? 1 : 0) +
    (current.min ? 1 : 0) +
    (current.max ? 1 : 0) +
    (current.chancaditos ? 1 : 0);

  const Fields = (
    <div className="space-y-6">
      {/* Categoría */}
      <div>
        <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">Categoría</h3>
        <div className="flex flex-col gap-1.5">
          <FilterRadio label="Todas" checked={!current.category} onClick={() => update({ category: null })} />
          {categories.map((c) => (
            <FilterRadio
              key={c.slug}
              label={c.name}
              checked={current.category === c.slug}
              onClick={() => update({ category: c.slug })}
            />
          ))}
        </div>
      </div>

      {/* Condición */}
      <div>
        <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">Condición</h3>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => update({ condition: current.condition === c ? null : c })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                current.condition === c
                  ? "border-oni-red bg-oni-red text-white"
                  : "border-oni-line bg-oni-ink text-oni-bone hover:border-oni-red"
              )}
            >
              {CONDITION_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">Disponibilidad</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY.map((a) => (
            <button
              key={a.v}
              onClick={() => update({ availability: current.availability === a.v ? null : a.v })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                current.availability === a.v
                  ? "border-oni-red bg-oni-red text-white"
                  : "border-oni-line bg-oni-ink text-oni-bone hover:border-oni-red"
              )}
            >
              {a.l}
            </button>
          ))}
          <button
            onClick={() => update({ oferta: current.oferta ? null : "1" })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              current.oferta
                ? "border-oni-red bg-oni-red text-white"
                : "border-oni-line bg-oni-ink text-oni-bone hover:border-oni-red"
            )}
          >
            En oferta
          </button>
        </div>
      </div>

      {/* Precio */}
      <div>
        <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">Precio (S/)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Mín"
            defaultValue={current.min}
            onBlur={(e) => update({ min: e.target.value || null })}
            className="h-10 w-full rounded-md border border-oni-line bg-oni-ink px-3 text-sm outline-none focus:border-oni-red"
          />
          <span className="text-oni-ash">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Máx"
            defaultValue={current.max}
            onBlur={(e) => update({ max: e.target.value || null })}
            className="h-10 w-full rounded-md border border-oni-line bg-oni-ink px-3 text-sm outline-none focus:border-oni-red"
          />
        </div>
      </div>

      {/* Anime / Tag */}
      {tags.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">Anime</h3>
          {tags.length > 12 && (
            <input
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              placeholder="Buscar anime…"
              className="mb-2 h-9 w-full rounded-md border border-oni-line bg-oni-ink px-3 text-xs outline-none focus:border-oni-gold"
            />
          )}
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {shownTags.map((t) => (
              <button
                key={t.slug}
                onClick={() => update({ tag: current.tag === t.slug ? null : t.slug })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  current.tag === t.slug
                    ? "border-oni-gold bg-oni-gold text-oni-black"
                    : "border-oni-line bg-oni-ink text-oni-bone hover:border-oni-gold"
                )}
              >
                {t.name}
              </button>
            ))}
            {shownTags.length === 0 && <p className="text-xs text-oni-ash">Sin coincidencias.</p>}
          </div>
        </div>
      )}

      {/* Marca / Fabricante */}
      {brands.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">Marca</h3>
          <select
            value={current.brand}
            onChange={(e) => update({ brand: e.target.value || null })}
            className="h-10 w-full rounded-md border border-oni-line bg-oni-ink px-3 text-sm outline-none focus:border-oni-red"
          >
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b} value={b} className="bg-oni-ink">{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* Género / Demografía */}
      {genres.length > 0 && (
        <div className="space-y-3">
          {(["DEMOGRAFIA", "GENERO"] as const).map((kind) => {
            const list = genres.filter((g) => g.kind === kind);
            if (!list.length) return null;
            return (
              <div key={kind}>
                <h3 className="mb-2 font-display text-sm tracking-wide text-oni-bone">
                  {kind === "DEMOGRAFIA" ? "Demografía" : "Género"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {list.map((g) => (
                    <button
                      key={g.slug}
                      onClick={() => update({ genre: current.genre === g.slug ? null : g.slug })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        current.genre === g.slug
                          ? "border-oni-red bg-oni-red text-white"
                          : "border-oni-line bg-oni-ink text-oni-bone hover:border-oni-red"
                      )}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chancaditos toggle */}
      {!hideChancaditos && (
        <button
          onClick={() => update({ chancaditos: current.chancaditos ? null : "1" })}
          className={cn(
            "flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium",
            current.chancaditos ? "border-oni-red bg-oni-red/15 text-oni-bone" : "border-oni-line bg-oni-ink text-oni-bone"
          )}
        >
          🔥 Solo Chancaditos (outlet)
          <span className={cn("grid h-5 w-5 place-items-center rounded border", current.chancaditos ? "border-oni-red bg-oni-red" : "border-oni-line")}>
            {current.chancaditos && <Check className="h-3.5 w-3.5 text-white" />}
          </span>
        </button>
      )}

      {activeCount > 0 && (
        <button onClick={clearAll} className="w-full rounded-md border border-oni-line py-2.5 text-sm text-oni-ash hover:text-oni-red">
          Limpiar filtros ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Toolbar mobile */}
      <div className="mb-4 flex items-center gap-2 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-md border border-oni-line bg-oni-ink px-4 py-2.5 text-sm font-medium"
        >
          <SlidersHorizontal className="h-4 w-4 text-oni-red" />
          Filtros
          {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-oni-red px-1 text-[11px] font-bold text-white">{activeCount}</span>}
        </button>
        <select
          value={current.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="ml-auto h-10 rounded-md border border-oni-line bg-oni-ink px-3 text-sm outline-none focus:border-oni-red"
        >
          {SORTS.map((s) => (
            <option key={s.v} value={s.v}>{s.l}</option>
          ))}
        </select>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:block">
        <div className="mb-4">
          <label className="mb-1 block text-xs uppercase tracking-widest text-oni-ash">Ordenar</label>
          <select
            value={current.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="h-10 w-full rounded-md border border-oni-line bg-oni-ink px-3 text-sm outline-none focus:border-oni-red"
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>{s.l}</option>
            ))}
          </select>
        </div>
        {Fields}
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-oni-line bg-oni-ink p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Filtros</h2>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="grid h-9 w-9 place-items-center text-oni-ash">
                <X className="h-6 w-6" />
              </button>
            </div>
            {Fields}
            <button
              onClick={() => setOpen(false)}
              className="mt-5 h-12 w-full rounded-md bg-oni-red font-display text-lg tracking-wide text-white"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterRadio({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-left text-sm">
      <span className={cn("grid h-4 w-4 place-items-center rounded-full border", checked ? "border-oni-red" : "border-oni-line")}>
        {checked && <span className="h-2 w-2 rounded-full bg-oni-red" />}
      </span>
      <span className={checked ? "text-oni-bone" : "text-oni-ash"}>{label}</span>
    </button>
  );
}
