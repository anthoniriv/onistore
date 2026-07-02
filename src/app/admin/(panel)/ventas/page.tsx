import Link from "next/link";
import { TrendingUp, ShoppingCart, Receipt, Package } from "lucide-react";
import { getSalesReport } from "@/lib/sales";
import { formatPrice, STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = [
  { d: 7, label: "7 días" },
  { d: 30, label: "30 días" },
  { d: 90, label: "90 días" },
];
const CHANNEL_LABEL: Record<string, string> = { WHATSAPP: "WhatsApp", YAPE: "Yape", PLIN: "Plin", CULQI: "Culqi", MERCADOPAGO: "MercadoPago" };

export default async function VentasPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.range)) ? Number(sp.range) : 30;
  const r = await getSalesReport(days);

  const kpis = [
    { label: "Ingresos", value: formatPrice(r.revenueCents), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Pedidos", value: r.orderCount, icon: ShoppingCart, color: "text-oni-red" },
    { label: "Ticket promedio", value: formatPrice(r.avgTicketCents), icon: Receipt, color: "text-oni-gold" },
    { label: "Unidades vendidas", value: r.unitsSold, icon: Package, color: "text-sky-400" },
  ];

  const maxDay = Math.max(1, ...r.byDay.map((d) => d.revenueCents));
  const maxTop = Math.max(1, ...r.topProducts.map((p) => p.units));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Ventas</h1>
        <div className="flex gap-1 rounded-md border border-oni-line bg-oni-ink p-1 text-sm">
          {RANGES.map((rg) => (
            <Link
              key={rg.d}
              href={`/admin/ventas?range=${rg.d}`}
              className={`rounded px-3 py-1.5 ${days === rg.d ? "bg-oni-red text-white" : "text-oni-ash hover:text-oni-bone"}`}
            >
              {rg.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-oni-ash">
        Desde {r.since.toLocaleDateString("es-PE", { dateStyle: "medium" })} · estados: pagado, preparando, enviado, entregado.
      </p>

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <k.icon className={`h-6 w-6 ${k.color}`} />
            <p className="mt-2 font-display text-2xl text-oni-bone">{k.value}</p>
            <p className="text-xs text-oni-ash">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tendencia diaria */}
      <section className="mt-6 rounded-oni border border-oni-line bg-oni-ink p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg">Ingresos por día</h2>
          <span className="text-xs text-oni-ash">máx {formatPrice(maxDay)}</span>
        </div>
        {r.revenueCents === 0 ? (
          <p className="py-10 text-center text-sm text-oni-ash">Sin ventas en este rango.</p>
        ) : (
          <div className="flex h-40 items-end gap-[3px] overflow-x-auto">
            {r.byDay.map((d) => (
              <div
                key={d.date}
                title={`${new Date(d.date).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })} · ${formatPrice(d.revenueCents)} · ${d.orders} pedido(s)`}
                className="group flex min-w-[6px] flex-1 flex-col justify-end"
              >
                <div
                  className="rounded-t bg-oni-gold/70 transition-colors group-hover:bg-oni-gold"
                  style={{ height: `${Math.max(2, (d.revenueCents / maxDay) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top productos */}
        <section className="rounded-oni border border-oni-line bg-oni-ink p-4">
          <h2 className="mb-3 font-display text-lg">Top productos</h2>
          {r.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-oni-ash">Sin datos.</p>
          ) : (
            <ul className="space-y-2.5">
              {r.topProducts.map((p) => (
                <li key={p.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="line-clamp-1 pr-2 text-oni-bone">{p.name}</span>
                    <span className="shrink-0 text-oni-ash">{p.units}u · {formatPrice(p.revenueCents)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-oni-surface">
                    <div className="h-full rounded-full bg-oni-red" style={{ width: `${(p.units / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Por canal + por estado */}
        <div className="space-y-6">
          <section className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <h2 className="mb-3 font-display text-lg">Por canal</h2>
            {r.byChannel.length === 0 ? (
              <p className="py-4 text-center text-sm text-oni-ash">Sin datos.</p>
            ) : (
              <ul className="divide-y divide-oni-line text-sm">
                {r.byChannel.map((c) => (
                  <li key={c.channel} className="flex items-center justify-between py-2">
                    <span className="text-oni-bone">{CHANNEL_LABEL[c.channel] ?? c.channel}</span>
                    <span className="text-oni-ash">{c.orders} · <span className="font-semibold text-oni-bone">{formatPrice(c.revenueCents)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-oni border border-oni-line bg-oni-ink p-4">
            <h2 className="mb-3 font-display text-lg">Por estado</h2>
            {r.byStatus.length === 0 ? (
              <p className="py-4 text-center text-sm text-oni-ash">Sin datos.</p>
            ) : (
              <ul className="divide-y divide-oni-line text-sm">
                {r.byStatus.map((s) => (
                  <li key={s.status} className="flex items-center justify-between py-2">
                    <span className="text-oni-bone">{STATUS_LABEL[s.status] ?? s.status}</span>
                    <span className="text-oni-ash">{s.orders} · <span className="font-semibold text-oni-bone">{formatPrice(s.revenueCents)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
