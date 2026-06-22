import Link from "next/link";
import { Package, ShoppingCart, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [products, pendingOrders, newMessages, paidAgg, recentOrders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.message.count({ where: { status: "NUEVO" } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { in: ["PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO"] } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { items: true } }),
    prisma.product.findMany({ where: { active: true, stock: { lte: 2 } }, orderBy: { stock: "asc" }, take: 6 }),
  ]);

  const stats = [
    { label: "Ventas confirmadas", value: formatPrice(paidAgg._sum.totalCents ?? 0), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Pedidos pendientes", value: pendingOrders, icon: ShoppingCart, color: "text-oni-red", href: "/admin/pedidos" },
    { label: "Productos", value: products, icon: Package, color: "text-oni-gold", href: "/admin/productos" },
    { label: "Mensajes nuevos", value: newMessages, icon: MessageSquare, color: "text-sky-400", href: "/admin/mensajes" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Card = (
            <div className="rounded-oni border border-oni-line bg-oni-ink p-4">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <p className="mt-2 font-display text-2xl">{s.value}</p>
              <p className="text-xs text-oni-ash">{s.label}</p>
            </div>
          );
          return s.href ? <Link key={s.label} href={s.href}>{Card}</Link> : <div key={s.label}>{Card}</div>;
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-oni border border-oni-line bg-oni-ink p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-sm text-oni-red">Ver todos</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-oni-ash">Aún no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-oni-line">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-oni-bone">{o.code} · {o.customerName}</p>
                    <p className="text-xs text-oni-ash">{o.items.length} item(s) · {STATUS_LABEL[o.status]}</p>
                  </div>
                  <span className="font-semibold text-oni-bone">{formatPrice(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-oni border border-oni-line bg-oni-ink p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg"><AlertTriangle className="h-5 w-5 text-oni-gold" /> Stock bajo</h2>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-oni-ash">Todo con stock saludable. 👹</p>
          ) : (
            <ul className="divide-y divide-oni-line">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/admin/productos/${p.id}`} className="line-clamp-1 text-oni-bone hover:text-oni-red">{p.name}</Link>
                  <span className={p.stock === 0 ? "text-oni-red" : "text-oni-gold"}>{p.stock} und</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
