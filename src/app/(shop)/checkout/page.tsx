"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { waLink, waOrderMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import { CheckoutStepper } from "@/components/checkout-stepper";
import { CouponInput } from "@/components/coupon-input";
import { ShoppingBag, CheckCircle2, Upload, Loader2, Smartphone, Store, Truck, FileText } from "lucide-react";

type Channel = "WHATSAPP" | "YAPE";
type Delivery = "PICKUP" | "DELIVERY";
type DocType = "BOLETA" | "FACTURA";

const YAPE = process.env.NEXT_PUBLIC_YAPE_NUMBER || "993109998";
const YAPE_NAME = process.env.NEXT_PUBLIC_YAPE_NAME || "ONISTORE";
const PICKUP_POINT = "Recojo en Arenales / Centro Cívico (Sáb–Dom)";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const subtotal = useCart((s) => s.subtotalCents());
  const coupon = useCart((s) => s.coupon);
  const discount = useCart((s) => s.discountCents());
  const total = useCart((s) => s.totalCents());

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    district: "",
    address: "",
    note: "",
    docNumber: "",
    businessName: "",
    fiscalAddress: "",
  });
  const [delivery, setDelivery] = useState<Delivery>("PICKUP");
  const [docType, setDocType] = useState<DocType>("BOLETA");
  const [channel, setChannel] = useState<Channel>("WHATSAPP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string; id: string } | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const deliveryLabel =
    delivery === "PICKUP" ? PICKUP_POINT : `Envío a ${form.district || "?"} — ${form.address || "?"}`;
  const docLabel =
    docType === "BOLETA"
      ? `Boleta${form.docNumber ? ` · DNI ${form.docNumber}` : ""}`
      : `Factura · RUC ${form.docNumber} (${form.businessName})`;

  function buildMsg(code: string) {
    return waOrderMessage({
      code,
      items: items.map((i) => ({ name: i.name, qty: i.qty, priceCents: i.priceCents })),
      subtotalCents: subtotal,
      discountCents: discount,
      couponCode: discount > 0 ? coupon?.code : undefined,
      customerName: form.customerName,
      channel: channel === "YAPE" ? "Yape/Plin" : "WhatsApp",
      delivery: deliveryLabel,
      doc: docLabel,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.customerName.trim().length < 2) return setError("Ingresa tu nombre.");
    if (form.phone.trim().length < 6) return setError("Ingresa un teléfono válido.");
    if (delivery === "DELIVERY" && (!form.district.trim() || !form.address.trim()))
      return setError("Para envío necesitas distrito y dirección.");
    if (docType === "FACTURA") {
      if (!/^\d{11}$/.test(form.docNumber)) return setError("El RUC debe tener 11 dígitos.");
      if (!form.businessName.trim()) return setError("Ingresa la razón social.");
    }
    if (docType === "BOLETA" && form.docNumber && !/^\d{8}$/.test(form.docNumber))
      return setError("El DNI debe tener 8 dígitos.");

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          channel: channel === "YAPE" ? "YAPE" : "WHATSAPP",
          deliveryMethod: delivery,
          docType,
          couponCode: coupon?.code,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo crear el pedido");

      setDone({ code: json.code, id: json.id });
      if (channel === "WHATSAPP") {
        window.open(waLink(buildMsg(json.code)), "_blank");
        clear();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function uploadProof(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !done) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("orderId", done.id);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (res.ok) setProofUrl(json.url);
    else setError(json.error || "No se pudo subir el comprobante");
  }

  // ---------- Éxito ----------
  if (done) {
    const confirmMsg = buildMsg(done.code);
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <CheckoutStepper current={3} />
        <div className="rounded-oni border border-oni-line bg-oni-ink p-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-3 font-display text-3xl text-oni-bone">¡Pedido recibido!</h1>
          <p className="mt-1 text-oni-ash">Tu código es</p>
          <p className="font-display text-2xl text-oni-red">{done.code}</p>

          {channel === "WHATSAPP" ? (
            <>
              <p className="mt-4 text-sm text-oni-ash">Abrimos WhatsApp con el detalle. Si no se abrió, toca el botón:</p>
              <a href={waLink(confirmMsg)} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-md bg-[#25D366] font-semibold text-white">
                <WhatsAppIcon className="h-5 w-5" /> Enviar pedido por WhatsApp
              </a>
            </>
          ) : (
            <div className="mt-5 text-left">
              <div className="rounded-md border border-oni-gold/40 bg-oni-gold/10 p-4">
                <p className="flex items-center gap-2 font-display text-lg text-oni-bone"><Smartphone className="h-5 w-5 text-oni-gold" /> Paga con Yape / Plin</p>
                <p className="mt-2 text-sm text-oni-ash">Número</p>
                <p className="font-display text-2xl text-oni-bone">{YAPE}</p>
                <p className="text-sm text-oni-ash">A nombre de <b className="text-oni-bone">{YAPE_NAME}</b></p>
                <p className="mt-2 font-display text-xl text-oni-red">Monto: {formatPrice(total)}</p>
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-oni-line py-4 text-sm text-oni-ash hover:border-oni-red">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                {proofUrl ? "Comprobante subido ✓ (sube otro)" : "Subir comprobante (captura)"}
                <input type="file" accept="image/*" className="hidden" onChange={uploadProof} />
              </label>
              {proofUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={proofUrl} alt="comprobante" className="mt-3 max-h-48 rounded-md border border-oni-line object-contain" />
              )}
              <a href={waLink(confirmMsg + "\n\n✅ Ya realicé el pago por Yape/Plin.")} target="_blank" rel="noopener noreferrer"
                onClick={() => clear()}
                className="mt-4 flex h-12 items-center justify-center gap-2 rounded-md bg-[#25D366] font-semibold text-white">
                <WhatsAppIcon className="h-5 w-5" /> Avisar pago por WhatsApp
              </a>
            </div>
          )}
          <Link href="/catalogo" className="mt-5 inline-block text-sm text-oni-ash hover:text-oni-red">Seguir comprando</Link>
        </div>
      </div>
    );
  }

  // ---------- Carrito vacío ----------
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckoutStepper current={2} />
        <ShoppingBag className="mx-auto h-14 w-14 text-oni-line" />
        <h1 className="mt-3 font-display text-2xl">Tu carrito está vacío</h1>
        <Link href="/catalogo" className="mt-4 inline-block rounded-md bg-oni-red px-6 py-3 font-semibold text-white">Ver catálogo</Link>
      </div>
    );
  }

  // ---------- Formulario ----------
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <CheckoutStepper current={2} />
      <h1 className="font-display text-3xl text-oni-bone sm:text-4xl">Finalizar pedido</h1>

      <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Datos */}
          <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <h2 className="mb-3 font-display text-lg">Tus datos</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre completo *" value={form.customerName} onChange={set("customerName")} placeholder="Ej. Anthony Rivera" />
              <Field label="WhatsApp / Teléfono *" value={form.phone} onChange={set("phone")} placeholder="9XX XXX XXX" inputMode="tel" />
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-oni-ash">Nota (opcional)</span>
              <textarea value={form.note} onChange={set("note")} rows={2}
                className="w-full rounded-md border border-oni-line bg-oni-surface p-3 text-sm outline-none focus:border-oni-red"
                placeholder="Algún detalle de tu pedido..." />
            </label>
          </div>

          {/* Entrega */}
          <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <h2 className="mb-3 font-display text-lg">Entrega</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Option active={delivery === "PICKUP"} onClick={() => setDelivery("PICKUP")}
                title="Recojo en Arenales" desc="Fines de semana en Arenales / Centro Cívico. Sin costo." icon={<Store className="h-6 w-6" />} />
              <Option active={delivery === "DELIVERY"} onClick={() => setDelivery("DELIVERY")}
                title="Envío a domicilio" desc="Costo según destino, se coordina por WhatsApp." icon={<Truck className="h-6 w-6" />} />
            </div>
            {delivery === "DELIVERY" && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Distrito *" value={form.district} onChange={set("district")} placeholder="Ej. Cercado, Cayma..." />
                <Field label="Dirección *" value={form.address} onChange={set("address")} placeholder="Calle, número, referencia" />
              </div>
            )}
          </div>

          {/* Comprobante */}
          <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg"><FileText className="h-5 w-5 text-oni-gold" /> Comprobante</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Option active={docType === "BOLETA"} onClick={() => setDocType("BOLETA")}
                title="Boleta" desc="A nombre de tu DNI (opcional)." icon={<FileText className="h-6 w-6" />} />
              <Option active={docType === "FACTURA"} onClick={() => setDocType("FACTURA")}
                title="Factura" desc="Con RUC y razón social." icon={<FileText className="h-6 w-6" />} />
            </div>
            {docType === "BOLETA" ? (
              <div className="mt-3">
                <Field label="DNI (opcional)" value={form.docNumber} onChange={set("docNumber")} placeholder="8 dígitos" inputMode="numeric" maxLength={8} />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="RUC *" value={form.docNumber} onChange={set("docNumber")} placeholder="11 dígitos" inputMode="numeric" maxLength={11} />
                <Field label="Razón social *" value={form.businessName} onChange={set("businessName")} placeholder="Empresa S.A.C." />
                <div className="sm:col-span-2">
                  <Field label="Dirección fiscal" value={form.fiscalAddress} onChange={set("fiscalAddress")} placeholder="Dirección registrada en SUNAT" />
                </div>
              </div>
            )}
          </div>

          {/* Pago */}
          <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <h2 className="mb-3 font-display text-lg">Método de pago</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Option active={channel === "WHATSAPP"} onClick={() => setChannel("WHATSAPP")}
                title="Coordinar por WhatsApp" desc="Cierra el pedido por chat. Pagas como prefieras." icon={<WhatsAppIcon className="h-6 w-6" />} />
              <Option active={channel === "YAPE"} onClick={() => setChannel("YAPE")}
                title="Yape / Plin" desc="Te damos el número y subes tu comprobante." icon={<Smartphone className="h-6 w-6" />} />
            </div>
          </div>

          {error && <p className="rounded-md bg-oni-red/15 px-4 py-3 text-sm text-oni-red-soft">{error}</p>}
        </div>

        {/* Resumen */}
        <aside className="h-fit rounded-oni border border-oni-line bg-oni-ink p-4 md:sticky md:top-24">
          <h2 className="mb-3 font-display text-lg">Tu pedido</h2>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2 text-sm">
                <span className="text-oni-ash">{i.qty}× {i.name}</span>
                <span className="shrink-0 text-oni-bone">{formatPrice(i.priceCents * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-oni-line pt-3">
            <CouponInput />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-oni-ash">Subtotal</span>
            <span className="text-oni-bone">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-oni-ash">Descuento {coupon ? `(${coupon.code})` : ""}</span>
              <span className="font-semibold text-emerald-400">−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between border-t border-oni-line pt-2">
            <span className="text-oni-ash">Total</span>
            <span className="font-display text-xl text-oni-bone">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-xs text-oni-ash">
            {delivery === "PICKUP" ? "Recojo sin costo en Arenales." : "El envío se coordina según tu ubicación."}
          </p>
          <button type="submit" disabled={loading}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-oni-red font-display text-lg tracking-wide text-white hover:bg-oni-red-dark disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar pedido"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-oni-ash">{label}</span>
      <input {...props} className="h-11 w-full rounded-md border border-oni-line bg-oni-surface px-3 text-sm outline-none focus:border-oni-red" />
    </label>
  );
}

function Option({ active, onClick, title, desc, icon }: { active: boolean; onClick: () => void; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${active ? "border-oni-red bg-oni-red/10" : "border-oni-line hover:border-oni-red/60"}`}>
      <span className={active ? "text-oni-red" : "text-oni-ash"}>{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-oni-bone">{title}</span>
        <span className="block text-xs text-oni-ash">{desc}</span>
      </span>
    </button>
  );
}
