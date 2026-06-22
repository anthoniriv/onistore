"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Save, Copy, Sparkles } from "lucide-react";
import { CONDITIONS, CONDITION_LABEL } from "@/lib/utils";
import { BRANDS } from "@/lib/brands";
import { saveProduct } from "@/app/admin/actions";

type Category = { id: string; name: string };
type Initial = {
  id?: string;
  name: string;
  description: string;
  anime: string | null;
  brand: string | null;
  sku: string | null;
  subcategory: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string;
  priceCents: number;
  discountCents: number | null;
  condition: string;
  stock: number;
  featured: boolean;
  isNew: boolean;
  isChancadito: boolean;
  chancaditoReason: string | null;
  active: boolean;
  images: { url: string }[];
  genres?: { genreId: string }[];
};

type Genre = { id: string; name: string; kind: string };

type Suggestion = {
  id: string;
  name: string;
  anime: string | null;
  brand: string | null;
  sku: string | null;
  categoryId: string;
  categoryName: string;
  priceCents: number;
  discountCents: number | null;
  condition: string;
  description: string;
  isChancadito: boolean;
  chancaditoReason: string | null;
  images: string[];
  genreIds: string[];
};

export function ProductForm({ categories, genres = [], initial }: { categories: Category[]; genres?: Genre[]; initial?: Initial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(initial?.images.map((i) => i.url) ?? []);
  const [genreIds, setGenreIds] = useState<string[]>(initial?.genres?.map((g) => g.genreId) ?? []);
  const toggleGenre = (id: string) =>
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(true);
  const dismissedRef = useRef<string>("");
  const [f, setF] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    anime: initial?.anime ?? "",
    brand: initial?.brand ?? "",
    sku: initial?.sku ?? "",
    subcategory: initial?.subcategory ?? "",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    priceSoles: initial ? (initial.priceCents / 100).toString() : "",
    discountSoles: initial?.discountCents ? (initial.discountCents / 100).toString() : "",
    condition: initial?.condition ?? "NUEVO",
    stock: initial?.stock?.toString() ?? "1",
    featured: initial?.featured ?? false,
    isNew: initial?.isNew ?? false,
    isChancadito: initial?.isChancadito ?? false,
    chancaditoReason: initial?.chancaditoReason ?? "",
    active: initial?.active ?? true,
  });

  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  // Sugerencias por título parecido (para copiar data de un producto existente)
  useEffect(() => {
    const term = f.name.trim();
    if (term.length < 3 || term === dismissedRef.current) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = `/api/admin/suggest?q=${encodeURIComponent(term)}${initial?.id ? `&exclude=${initial.id}` : ""}`;
        const res = await fetch(url, { signal: ctrl.signal });
        const json = await res.json();
        setSuggestions(json.results ?? []);
        setShowSuggest(true);
      } catch {
        /* abortado */
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [f.name, initial?.id]);

  function applySuggestion(s: Suggestion, withImages: boolean) {
    setF((p) => ({
      ...p,
      // se conserva el nombre que el admin está escribiendo
      description: s.description,
      anime: s.anime ?? "",
      brand: s.brand ?? "",
      sku: "", // el SKU es único por producto
      categoryId: s.categoryId,
      priceSoles: (s.priceCents / 100).toString(),
      discountSoles: s.discountCents ? (s.discountCents / 100).toString() : "",
      condition: s.condition,
      isChancadito: s.isChancadito,
      chancaditoReason: s.chancaditoReason ?? "",
    }));
    setGenreIds(s.genreIds);
    if (withImages) setImages(s.images);
    dismissedRef.current = f.name.trim();
    setShowSuggest(false);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (res.ok) setImages((prev) => [...prev, j.url]);
      else setError(j.error || "Error al subir imagen");
    }
    setUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (f.name.trim().length < 2) return setError("Falta el nombre.");
    if (!f.priceSoles || Number(f.priceSoles) <= 0) return setError("Precio inválido.");
    setSaving(true);
    try {
      await saveProduct({
        id: initial?.id,
        name: f.name,
        description: f.description,
        anime: f.anime,
        brand: f.brand,
        sku: f.sku,
        subcategory: f.subcategory,
        seoTitle: f.seoTitle,
        seoDescription: f.seoDescription,
        categoryId: f.categoryId,
        priceSoles: Number(f.priceSoles),
        discountSoles: f.discountSoles ? Number(f.discountSoles) : null,
        condition: f.condition,
        stock: Number(f.stock) || 0,
        featured: f.featured,
        isNew: f.isNew,
        isChancadito: f.isChancadito,
        chancaditoReason: f.chancaditoReason,
        active: f.active,
        images,
        genreIds,
      });
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("No se pudo guardar el producto.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Box title="Información">
          <div className="relative">
            <L label="Nombre *">
              <input
                value={f.name}
                onChange={(e) => set("name", e.target.value)}
                onFocus={() => setShowSuggest(true)}
                className={inp}
                placeholder="Ej. Manga X vol. 7"
              />
            </L>
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-oni-red/50 bg-oni-ink shadow-xl">
                <div className="flex items-center justify-between border-b border-oni-line px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-oni-gold">
                    <Sparkles className="h-3.5 w-3.5" /> Productos parecidos — copia su data
                  </span>
                  <button type="button" onClick={() => setShowSuggest(false)} className="text-oni-ash hover:text-oni-bone">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ul className="max-h-72 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 border-b border-oni-line px-3 py-2 last:border-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.images[0] ?? "/placeholders/p1.svg"} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm text-oni-bone">{s.name}</p>
                        <p className="text-xs text-oni-ash">{s.categoryName}{s.anime ? ` · ${s.anime}` : ""}{s.brand ? ` · ${s.brand}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button type="button" onClick={() => applySuggestion(s, false)}
                          className="flex items-center gap-1 rounded bg-oni-red px-2 py-1 text-xs font-semibold text-white hover:bg-oni-red-dark">
                          <Copy className="h-3 w-3" /> Copiar datos
                        </button>
                        <button type="button" onClick={() => applySuggestion(s, true)}
                          className="rounded border border-oni-line px-2 py-1 text-[11px] text-oni-ash hover:border-oni-red hover:text-oni-bone">
                          + con imágenes
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <L label="Descripción">
            <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} className={`${inp} h-auto py-2`} />
          </L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Anime / Serie"><input value={f.anime} onChange={(e) => set("anime", e.target.value)} className={inp} /></L>
            <L label="Marca / Editorial">
              <input
                list="brand-list"
                value={f.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Elige o escribe..."
                className={inp}
              />
              <datalist id="brand-list">
                {BRANDS.map((b) => <option key={b} value={b} />)}
              </datalist>
            </L>
            <L label="SKU"><input value={f.sku} onChange={(e) => set("sku", e.target.value)} className={inp} /></L>
            <L label="Categoría">
              <select value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inp}>
                {categories.map((c) => <option key={c.id} value={c.id} className="bg-oni-ink text-oni-bone">{c.name}</option>)}
              </select>
            </L>
            <L label="Subcategoría"><input value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder="Ej. Nendoroid, Tankōbon" className={inp} /></L>
          </div>
        </Box>

        <Box title="Imágenes">
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-24 w-24 overflow-hidden rounded-md border border-oni-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages((p) => p.filter((u) => u !== url))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-md border border-dashed border-oni-line text-oni-ash hover:border-oni-red">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
            </label>
          </div>
          <p className="mt-2 text-xs text-oni-ash">La primera imagen es la principal. JPG/PNG/WEBP, máx 6MB.</p>
        </Box>

        {genres.length > 0 && (
          <Box title="Géneros / Demografía">
            {(["DEMOGRAFIA", "GENERO"] as const).map((kind) => {
              const list = genres.filter((g) => g.kind === kind);
              if (!list.length) return null;
              return (
                <div key={kind}>
                  <p className="mb-2 text-xs uppercase tracking-widest text-oni-ash">
                    {kind === "DEMOGRAFIA" ? "Demografía" : "Género"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {list.map((g) => {
                      const on = genreIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGenre(g.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${on ? "border-oni-red bg-oni-red text-white" : "border-oni-line bg-oni-surface text-oni-bone hover:border-oni-red"}`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </Box>
        )}

        <Box title="SEO (opcional)">
          <L label="Título SEO"><input value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Si vacío, se usa el nombre del producto" className={inp} /></L>
          <L label="Meta descripción">
            <textarea value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} placeholder="Resumen para Google (si vacío, se autogenera)" className={`${inp} h-auto py-2`} />
          </L>
        </Box>
      </div>

      <div className="space-y-4">
        <Box title="Precio y stock">
          <div className="grid grid-cols-2 gap-3">
            <L label="Precio (S/) *"><input type="number" step="0.1" value={f.priceSoles} onChange={(e) => set("priceSoles", e.target.value)} className={inp} /></L>
            <L label="Oferta (S/)"><input type="number" step="0.1" value={f.discountSoles} onChange={(e) => set("discountSoles", e.target.value)} className={inp} /></L>
            <L label="Stock"><input type="number" value={f.stock} onChange={(e) => set("stock", e.target.value)} className={inp} /></L>
            <L label="Condición">
              <select value={f.condition} onChange={(e) => set("condition", e.target.value)} className={inp}>
                {CONDITIONS.map((c) => <option key={c} value={c} className="bg-oni-ink text-oni-bone">{CONDITION_LABEL[c]}</option>)}
              </select>
            </L>
          </div>
        </Box>

        <Box title="Opciones">
          <Check label="Destacado (home)" checked={f.featured} onChange={(v) => set("featured", v)} />
          <Check label="Nuevo ingreso (badge)" checked={f.isNew} onChange={(v) => set("isNew", v)} />
          <Check label="Activo (visible)" checked={f.active} onChange={(v) => set("active", v)} />
          <Check label="Chancadito (outlet)" checked={f.isChancadito} onChange={(v) => set("isChancadito", v)} />
          {f.isChancadito && (
            <L label="Detalle del chancadito"><input value={f.chancaditoReason} onChange={(e) => set("chancaditoReason", e.target.value)} placeholder="Caja con golpe leve..." className={inp} /></L>
          )}
        </Box>

        {error && <p className="rounded-md bg-oni-red/15 px-3 py-2 text-sm text-oni-red-soft">{error}</p>}
        <button type="submit" disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark disabled:opacity-60">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Guardar producto</>}
        </button>
      </div>
    </form>
  );
}

const inp = "h-10 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm text-oni-bone outline-none focus:border-oni-red";

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
      <h2 className="mb-3 font-display text-lg">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="mb-1 block text-oni-ash">{label}</span>{children}</label>;
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#d32027]" />
      {label}
    </label>
  );
}
