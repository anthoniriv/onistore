"use client";

import { useState, useTransition } from "react";
import { MessageCircle, FileImage, Store, Truck, FileText, Trash2, X } from "lucide-react";
import { formatPrice, ORDER_STATUS, STATUS_LABEL } from "@/lib/utils";
import { OrderStatus } from "@/components/admin/order-status";
import { deleteOrder, deleteOrders, setOrdersStatus } from "@/app/admin/actions";

const CHANNEL_LABEL: Record<string, string> = { WHATSAPP: "WhatsApp", YAPE: "Yape", PLIN: "Plin" };

type Item = { id: string; name: string; qty: number; priceCents: number };
export type AdminOrder = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  channel: string;
  status: string;
  createdAt: string | Date;
  deliveryMethod: string;
  district: string | null;
  address: string | null;
  docType: string;
  docNumber: string | null;
  businessName: string | null;
  totalCents: number;
  subtotalCents: number;
  discountCents: number;
  couponCode: string | null;
  note: string | null;
  paymentProofUrl: string | null;
  items: Item[];
};

export function OrdersManager({ orders }: { orders: AdminOrder[] }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [confirmOne, setConfirmOne] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [pending, start] = useTransition();

  const toggle = (id: string) =>
    setSel((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allSelected = orders.length > 0 && sel.size === orders.length;
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(orders.map((o) => o.id)));
  const clear = () => setSel(new Set());

  if (orders.length === 0)
    return <p className="mt-8 rounded-oni border border-oni-line bg-oni-ink py-16 text-center text-oni-ash">Aún no hay pedidos.</p>;

  return (
    <div className="mt-5">
      {/* Barra de selección */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-oni border border-oni-line bg-oni-ink px-3 py-2 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[#7b5ea7]" />
          <span className="text-oni-ash">{sel.size > 0 ? `${sel.size} seleccionado(s)` : "Seleccionar todo"}</span>
        </label>

        {sel.size > 0 && (
          <>
            <select
              value={bulkStatus}
              onChange={(e) => {
                const s = e.target.value;
                setBulkStatus("");
                if (s) start(() => setOrdersStatus([...sel], s).then(clear));
              }}
              disabled={pending}
              className="rounded-md border border-oni-line bg-oni-surface px-2 py-1.5 text-xs outline-none"
            >
              <option value="">Cambiar estado…</option>
              {ORDER_STATUS.map((s) => (
                <option key={s} value={s} className="bg-oni-ink">{STATUS_LABEL[s]}</option>
              ))}
            </select>

            {confirmBulk ? (
              <span className="flex items-center gap-2">
                <button
                  onClick={() => start(() => deleteOrders([...sel]).then(() => { clear(); setConfirmBulk(false); }))}
                  disabled={pending}
                  className="rounded-md bg-oni-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-oni-red-dark disabled:opacity-50"
                >
                  Confirmar borrado de {sel.size}
                </button>
                <button onClick={() => setConfirmBulk(false)} className="text-oni-ash hover:text-oni-bone"><X className="h-4 w-4" /></button>
              </span>
            ) : (
              <button onClick={() => setConfirmBulk(true)} className="flex items-center gap-1.5 rounded-md border border-oni-red/50 px-3 py-1.5 text-xs font-semibold text-oni-red hover:bg-oni-red hover:text-white">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            )}
            <button onClick={clear} className="text-xs text-oni-ash hover:text-oni-bone">Limpiar</button>
          </>
        )}
      </div>

      <div className="space-y-3">
        {orders.map((o) => {
          const wa = `https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0+/, "")}`;
          const checked = sel.has(o.id);
          return (
            <div key={o.id} className={`rounded-oni border bg-oni-ink p-4 ${checked ? "border-oni-red" : "border-oni-line"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <input type="checkbox" checked={checked} onChange={() => toggle(o.id)} className="mt-1 h-4 w-4 shrink-0 accent-[#7b5ea7]" />
                  <div>
                    <p className="font-display text-lg text-oni-bone">{o.code}</p>
                    <p className="text-sm text-oni-bone">{o.customerName} · <span className="text-oni-ash">{o.phone}</span></p>
                    <p className="text-xs text-oni-ash">
                      {new Date(o.createdAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })} · {CHANNEL_LABEL[o.channel] ?? o.channel}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-oni-ash">
                      {o.deliveryMethod === "DELIVERY" ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                      {o.deliveryMethod === "DELIVERY"
                        ? `Envío · ${[o.district, o.address].filter(Boolean).join(", ") || "sin dirección"}`
                        : "Recojo en Arenales"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-oni-ash">
                      <FileText className="h-3 w-3" />
                      {o.docType === "FACTURA"
                        ? `Factura · RUC ${o.docNumber ?? "—"}${o.businessName ? ` · ${o.businessName}` : ""}`
                        : `Boleta${o.docNumber ? ` · DNI ${o.docNumber}` : ""}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-display text-xl text-oni-bone">{formatPrice(o.totalCents)}</span>
                  <OrderStatus id={o.id} status={o.status} />
                </div>
              </div>

              <ul className="mt-3 space-y-1 border-t border-oni-line pt-3 text-sm">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between text-oni-ash">
                    <span>{it.qty}× {it.name}</span>
                    <span>{formatPrice(it.priceCents * it.qty)}</span>
                  </li>
                ))}
              </ul>

              {o.discountCents > 0 && (
                <p className="mt-2 text-xs text-emerald-400">🏷️ Cupón {o.couponCode}: −{formatPrice(o.discountCents)} (subtotal {formatPrice(o.subtotalCents)})</p>
              )}
              {o.note && <p className="mt-2 text-xs text-oni-ash">📝 {o.note}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
                  <MessageCircle className="h-3.5 w-3.5" /> Escribir
                </a>
                {o.paymentProofUrl && (
                  <a href={o.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md border border-oni-line px-3 py-1.5 text-xs text-oni-bone hover:border-oni-red">
                    <FileImage className="h-3.5 w-3.5" /> Ver comprobante
                  </a>
                )}
                {confirmOne === o.id ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => start(() => deleteOrder(o.id).then(() => setConfirmOne(null)))}
                      disabled={pending}
                      className="rounded-md bg-oni-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-oni-red-dark disabled:opacity-50"
                    >
                      Confirmar eliminar
                    </button>
                    <button onClick={() => setConfirmOne(null)} className="text-oni-ash hover:text-oni-bone"><X className="h-4 w-4" /></button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmOne(o.id)} className="ml-auto flex items-center gap-1.5 rounded-md border border-oni-line px-3 py-1.5 text-xs text-oni-ash hover:border-oni-red hover:text-oni-red">
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
