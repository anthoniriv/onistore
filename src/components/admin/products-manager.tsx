"use client";

import { useState, useTransition } from "react";
import { Trash2, Eye, EyeOff, X } from "lucide-react";
import { formatPrice, CONDITION_LABEL, CONDITIONS } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import {
  deleteProducts,
  setProductsActive,
  setProductsCategory,
  setProductsCondition,
  setProductsChancadito,
} from "@/app/admin/actions";

type ProductRow = {
  id: string;
  name: string;
  active: boolean;
  featured: boolean;
  isChancadito: boolean;
  condition: string;
  priceCents: number;
  discountCents: number | null;
  stock: number;
  category: { name: string };
  images: { url: string }[];
};

export function ProductsManager({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: { id: string; name: string }[];
}) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [pending, start] = useTransition();

  const ids = () => [...sel];
  const toggle = (id: string) =>
    setSel((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allSelected = products.length > 0 && sel.size === products.length;
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  const clear = () => setSel(new Set());
  const run = (fn: Promise<unknown>) => start(() => fn.then(clear));

  return (
    <div>
      {/* Toolbar masivo */}
      {sel.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-oni border border-oni-red/40 bg-oni-ink px-3 py-2 text-sm">
          <span className="font-semibold text-oni-bone">{sel.size} seleccionado(s)</span>

          <button onClick={() => run(setProductsActive(ids(), true))} disabled={pending} className="flex items-center gap-1 rounded-md border border-oni-line px-2.5 py-1.5 text-xs hover:border-oni-red">
            <Eye className="h-3.5 w-3.5" /> Mostrar
          </button>
          <button onClick={() => run(setProductsActive(ids(), false))} disabled={pending} className="flex items-center gap-1 rounded-md border border-oni-line px-2.5 py-1.5 text-xs hover:border-oni-red">
            <EyeOff className="h-3.5 w-3.5" /> Ocultar
          </button>

          <select
            defaultValue=""
            onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) run(setProductsCategory(ids(), v)); }}
            disabled={pending}
            className="rounded-md border border-oni-line bg-oni-surface px-2 py-1.5 text-xs outline-none"
          >
            <option value="">Categoría…</option>
            {categories.map((c) => <option key={c.id} value={c.id} className="bg-oni-ink">{c.name}</option>)}
          </select>

          <select
            defaultValue=""
            onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) run(setProductsCondition(ids(), v)); }}
            disabled={pending}
            className="rounded-md border border-oni-line bg-oni-surface px-2 py-1.5 text-xs outline-none"
          >
            <option value="">Condición…</option>
            {CONDITIONS.map((c) => <option key={c} value={c} className="bg-oni-ink">{CONDITION_LABEL[c]}</option>)}
          </select>

          <button onClick={() => run(setProductsChancadito(ids(), true))} disabled={pending} className="rounded-md border border-oni-line px-2.5 py-1.5 text-xs hover:border-oni-red">Marcar chancadito</button>
          <button onClick={() => run(setProductsChancadito(ids(), false))} disabled={pending} className="rounded-md border border-oni-line px-2.5 py-1.5 text-xs hover:border-oni-red">Quitar chancadito</button>

          {confirmBulk ? (
            <span className="flex items-center gap-2">
              <button onClick={() => start(() => deleteProducts(ids()).then(() => { clear(); setConfirmBulk(false); }))} disabled={pending} className="rounded-md bg-oni-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-oni-red-dark disabled:opacity-50">
                Confirmar borrado de {sel.size}
              </button>
              <button onClick={() => setConfirmBulk(false)} className="text-oni-ash hover:text-oni-bone"><X className="h-4 w-4" /></button>
            </span>
          ) : (
            <button onClick={() => setConfirmBulk(true)} className="flex items-center gap-1 rounded-md border border-oni-red/50 px-2.5 py-1.5 text-xs font-semibold text-oni-red hover:bg-oni-red hover:text-white">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </button>
          )}
          <button onClick={clear} className="ml-auto text-xs text-oni-ash hover:text-oni-bone">Limpiar</button>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-oni border border-oni-line">
        <table className="w-full text-sm">
          <thead className="bg-oni-ink text-left text-xs uppercase tracking-wide text-oni-ash">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[#7b5ea7]" /></th>
              <th className="p-3">Producto</th>
              <th className="hidden p-3 sm:table-cell">Categoría</th>
              <th className="hidden p-3 md:table-cell">Condición</th>
              <th className="p-3">Precio</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oni-line bg-oni-black">
            {products.map((p) => {
              const checked = sel.has(p.id);
              return (
                <tr key={p.id} className={`${p.active ? "" : "opacity-50"} ${checked ? "bg-oni-red/5" : ""}`}>
                  <td className="p-3"><input type="checkbox" checked={checked} onChange={() => toggle(p.id)} className="h-4 w-4 accent-[#7b5ea7]" /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]?.url ?? "/placeholders/p1.svg"} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
                      <div>
                        <p className="line-clamp-1 font-medium text-oni-bone">{p.name}</p>
                        <p className="flex gap-1 text-xs text-oni-ash">
                          {p.featured && <span className="text-oni-gold">★ destacado</span>}
                          {p.isChancadito && <span className="text-oni-red">chancadito</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden p-3 text-oni-ash sm:table-cell">{p.category.name}</td>
                  <td className="hidden p-3 text-oni-ash md:table-cell">{CONDITION_LABEL[p.condition]}</td>
                  <td className="p-3 font-medium text-oni-bone">
                    {formatPrice(p.discountCents ?? p.priceCents)}
                    {p.discountCents && <span className="ml-1 text-xs text-oni-ash line-through">{formatPrice(p.priceCents)}</span>}
                  </td>
                  <td className="p-3 text-center"><span className={p.stock === 0 ? "text-oni-red" : p.stock <= 2 ? "text-oni-gold" : "text-oni-bone"}>{p.stock}</span></td>
                  <td className="p-3"><ProductRowActions id={p.id} active={p.active} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-oni-ash">Sin productos. Crea el primero.</p>}
      </div>
    </div>
  );
}
