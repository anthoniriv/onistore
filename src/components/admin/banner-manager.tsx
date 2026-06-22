"use client";

import { useState, useTransition } from "react";
import { Loader2, Upload, Trash2, Plus, Save, X } from "lucide-react";
import { saveBanner, deleteBanner } from "@/app/admin/actions";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaHref: string | null;
  order: number;
  active: boolean;
};

const empty = { title: "", subtitle: "", imageUrl: "", ctaText: "", ctaHref: "", order: 0, active: true };

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const initialFor = (id: string | "new") =>
    id === "new" ? empty : (() => { const b = banners.find((x) => x.id === id)!; return { ...b, subtitle: b.subtitle ?? "", ctaText: b.ctaText ?? "", ctaHref: b.ctaHref ?? "" }; })();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Banners (Hero)</h1>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 rounded-md bg-oni-red px-4 py-2.5 font-semibold text-white hover:bg-oni-red-dark">
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {editing && (
        <BannerForm
          initial={editing === "new" ? undefined : { id: editing, ...initialFor(editing) }}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="mt-5 space-y-3">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-oni border border-oni-line bg-oni-ink p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt="" className="h-16 w-28 shrink-0 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-oni-bone">{b.title}</p>
              <p className="truncate text-xs text-oni-ash">{b.subtitle}</p>
              <p className="text-xs text-oni-ash">Orden {b.order} · {b.active ? "Activo" : "Oculto"}</p>
            </div>
            <button onClick={() => setEditing(b.id)} className="rounded-md border border-oni-line px-3 py-1.5 text-xs hover:border-oni-red">Editar</button>
            <DeleteBtn id={b.id} />
          </div>
        ))}
        {banners.length === 0 && <p className="rounded-oni border border-oni-line bg-oni-ink py-12 text-center text-oni-ash">Sin banners.</p>}
      </div>
    </div>
  );
}

function DeleteBtn({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button onClick={() => start(() => deleteBanner(id))} className="grid h-8 w-8 place-items-center text-oni-ash hover:text-oni-red">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

function BannerForm({ initial, onClose }: { initial?: Banner; onClose: () => void }) {
  const [f, setF] = useState({
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    imageUrl: initial?.imageUrl ?? "",
    ctaText: initial?.ctaText ?? "",
    ctaHref: initial?.ctaHref ?? "",
    order: initial?.order ?? 0,
    active: initial?.active ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, startSave] = useTransition();
  const set = (k: keyof typeof f, v: string | number | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    setUploading(false);
    if (res.ok) set("imageUrl", j.url);
  }

  const inp = "h-10 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm outline-none focus:border-oni-red";

  return (
    <div className="mt-4 rounded-oni border border-oni-red/40 bg-oni-ink p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg">{initial ? "Editar banner" : "Nuevo banner"}</h2>
        <button onClick={onClose} className="text-oni-ash hover:text-oni-bone"><X className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Título</span><input value={f.title} onChange={(e) => set("title", e.target.value)} className={inp} /></label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Subtítulo</span><input value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={inp} /></label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Texto del botón</span><input value={f.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={inp} /></label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Link del botón</span><input value={f.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder="/catalogo" className={inp} /></label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Orden</span><input type="number" value={f.order} onChange={(e) => set("order", Number(e.target.value))} className={inp} /></label>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="mb-2 h-4 w-4 accent-[#d32027]" /> <span className="mb-2">Activo</span></label>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {f.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={f.imageUrl} alt="" className="h-16 w-28 rounded object-cover" />
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-oni-line px-4 py-3 text-sm text-oni-ash hover:border-oni-red">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Subir imagen (1600×700)
          <input type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
      </div>

      <button
        disabled={saving || !f.imageUrl || !f.title}
        onClick={() => startSave(async () => { await saveBanner({ id: initial?.id, ...f }); onClose(); })}
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md bg-oni-red px-6 font-display tracking-wide text-white hover:bg-oni-red-dark disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar</>}
      </button>
    </div>
  );
}
