import { MessageCircle, FileImage, Store, Truck, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "@/components/admin/order-status";

export const dynamic = "force-dynamic";

const CHANNEL_LABEL: Record<string, string> = { WHATSAPP: "WhatsApp", YAPE: "Yape", PLIN: "Plin" };

export default async function AdminPedidos() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <div>
      <h1 className="font-display text-3xl">Pedidos <span className="text-base text-oni-ash">({orders.length})</span></h1>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-oni border border-oni-line bg-oni-ink py-16 text-center text-oni-ash">Aún no hay pedidos.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map((o) => {
            const wa = `https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0+/, "")}`;
            return (
              <div key={o.id} className="rounded-oni border border-oni-line bg-oni-ink p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
