"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Save, X, Ticket } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { saveCoupon, deleteCoupon, toggleCouponActive } from "@/app/admin/actions";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minSubtotalCents: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null; // ISO
};

const inp = "h-10 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm text-oni-bone outline-none focus:border-oni-red";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Cupones <span className="text-base text-oni-ash">({coupons.length})</span></h1>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 rounded-md bg-oni-red px-4 py-2.5 font-semibold text-white hover:bg-oni-red-dark">
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {editing && <CouponForm initial={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}

      <div className="mt-5 overflow-hidden rounded-oni border border-oni-line">
        <table className="w-full text-sm">
          <thead className="bg-oni-ink text-left text-xs uppercase tracking-wide text-oni-ash">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Descuento</th>
              <th className="hidden p-3 sm:table-cell">Mín.</th>
              <th className="hidden p-3 sm:table-cell">Usos</th>
              <th className="hidden p-3 md:table-cell">Vence</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oni-line bg-oni-black">
            {coupons.map((c) => (
              <tr key={c.id} className={c.active ? "" : "opacity-50"}>
                <td className="p-3 font-display tracking-wide text-oni-bone">{c.code}</td>
                <td className="p-3 text-oni-bone">{c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="hidden p-3 text-oni-ash sm:table-cell">{c.minSubtotalCents > 0 ? formatPrice(c.minSubtotalCents) : "—"}</td>
                <td className="hidden p-3 text-oni-ash sm:table-cell">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                <td className="hidden p-3 text-oni-ash md:table-cell">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("es-PE") : "—"}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <ToggleBtn id={c.id} active={c.active} />
                    <button onClick={() => setEditing(c)} className="rounded-md border border-oni-line px-3 py-1.5 text-xs hover:border-oni-red">Editar</button>
                    <DeleteBtn id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="flex flex-col items-center gap-2 p-10 text-center text-oni-ash">
            <Ticket className="h-8 w-8 text-oni-line" /> Sin cupones. Crea el primero.
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleBtn({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button onClick={() => start(() => toggleCouponActive(id, !active))} disabled={pending}
      className={`rounded-md px-2 py-1 text-xs font-semibold ${active ? "bg-emerald-600/80 text-white" : "border border-oni-line text-oni-ash"}`}>
      {pending ? "..." : active ? "Activo" : "Inactivo"}
    </button>
  );
}

function DeleteBtn({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <button onClick={() => start(() => deleteCoupon(id))} className="rounded bg-oni-red px-2 py-1 text-xs text-white">
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "¿Borrar?"}
    </button>
  ) : (
    <button onClick={() => setConfirm(true)} aria-label="Eliminar" className="grid h-8 w-8 place-items-center text-oni-ash hover:text-oni-red">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function CouponForm({ initial, onClose }: { initial?: Coupon; onClose: () => void }) {
  const [f, setF] = useState({
    code: initial?.code ?? "",
    type: (initial?.type as "PERCENT" | "FIXED") ?? "PERCENT",
    value: initial ? (initial.type === "FIXED" ? (initial.value / 100).toString() : initial.value.toString()) : "10",
    minSubtotalSoles: initial ? (initial.minSubtotalCents / 100).toString() : "",
    maxUses: initial?.maxUses?.toString() ?? "",
    expiresAt: initial?.expiresAt ? initial.expiresAt.slice(0, 10) : "",
    active: initial?.active ?? true,
  });
  const [saving, startSave] = useTransition();
  const [error, setError] = useState("");
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  function submit() {
    setError("");
    startSave(async () => {
      const err = await saveCoupon({
        id: initial?.id,
        code: f.code,
        type: f.type,
        value: Number(f.value) || 0,
        minSubtotalSoles: Number(f.minSubtotalSoles) || 0,
        maxUses: f.maxUses ? Number(f.maxUses) : null,
        active: f.active,
        expiresAt: f.expiresAt || null,
      });
      if (err) setError(err);
      else onClose();
    });
  }

  return (
    <div className="mt-4 rounded-oni border border-oni-red/40 bg-oni-ink p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg">{initial ? "Editar cupón" : "Nuevo cupón"}</h2>
        <button onClick={onClose} className="text-oni-ash hover:text-oni-bone"><X className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Código</span>
          <input value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="BIENVENIDO10" className={`${inp} uppercase`} />
        </label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Tipo</span>
          <select value={f.type} onChange={(e) => set("type", e.target.value)} className={inp}>
            <option value="PERCENT" className="bg-oni-ink">Porcentaje (%)</option>
            <option value="FIXED" className="bg-oni-ink">Monto fijo (S/)</option>
          </select>
        </label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">{f.type === "PERCENT" ? "Descuento (%)" : "Descuento (S/)"}</span>
          <input type="number" step={f.type === "PERCENT" ? "1" : "0.1"} value={f.value} onChange={(e) => set("value", e.target.value)} className={inp} />
        </label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Compra mínima (S/)</span>
          <input type="number" step="0.1" value={f.minSubtotalSoles} onChange={(e) => set("minSubtotalSoles", e.target.value)} placeholder="0 = sin mínimo" className={inp} />
        </label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Usos máximos</span>
          <input type="number" value={f.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder="Vacío = ilimitado" className={inp} />
        </label>
        <label className="text-sm"><span className="mb-1 block text-oni-ash">Vence (opcional)</span>
          <input type="date" value={f.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={inp} />
        </label>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[#c81010]" /> Activo
      </label>
      {error && <p className="mt-2 text-sm text-oni-red-soft">{error}</p>}
      <button disabled={saving || !f.code} onClick={submit}
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md bg-oni-red px-6 font-display tracking-wide text-white hover:bg-oni-red-dark disabled:opacity-50">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar</>}
      </button>
    </div>
  );
}
