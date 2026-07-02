import { prisma } from "./prisma";

// Estados que cuentan como venta real (excluye PENDIENTE y CANCELADO)
export const PAID_STATUSES = ["PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO"];

export type SalesReport = Awaited<ReturnType<typeof getSalesReport>>;

export async function getSalesReport(days: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: { status: { in: PAID_STATUSES }, createdAt: { gte: since } },
    select: {
      totalCents: true,
      channel: true,
      status: true,
      createdAt: true,
      items: { select: { name: true, qty: true, priceCents: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const revenueCents = orders.reduce((s, o) => s + o.totalCents, 0);
  const orderCount = orders.length;
  const unitsSold = orders.reduce((s, o) => s + o.items.reduce((n, it) => n + it.qty, 0), 0);
  const avgTicketCents = orderCount ? Math.round(revenueCents / orderCount) : 0;

  // Serie diaria (rellena días sin ventas con 0)
  const dayKey = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD (local)
  const byDayMap = new Map<string, { revenueCents: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    byDayMap.set(dayKey(d), { revenueCents: 0, orders: 0 });
  }
  for (const o of orders) {
    const k = dayKey(new Date(o.createdAt));
    const b = byDayMap.get(k);
    if (b) { b.revenueCents += o.totalCents; b.orders += 1; }
  }
  const byDay = [...byDayMap.entries()].map(([date, v]) => ({ date, ...v }));

  // Por canal
  const channelMap = new Map<string, { revenueCents: number; orders: number }>();
  for (const o of orders) {
    const b = channelMap.get(o.channel) ?? { revenueCents: 0, orders: 0 };
    b.revenueCents += o.totalCents; b.orders += 1;
    channelMap.set(o.channel, b);
  }
  const byChannel = [...channelMap.entries()]
    .map(([channel, v]) => ({ channel, ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  // Por estado
  const statusMap = new Map<string, { revenueCents: number; orders: number }>();
  for (const o of orders) {
    const b = statusMap.get(o.status) ?? { revenueCents: 0, orders: 0 };
    b.revenueCents += o.totalCents; b.orders += 1;
    statusMap.set(o.status, b);
  }
  const byStatus = [...statusMap.entries()].map(([status, v]) => ({ status, ...v }));

  // Top productos (por unidades e ingresos)
  const prodMap = new Map<string, { units: number; revenueCents: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const b = prodMap.get(it.name) ?? { units: 0, revenueCents: 0 };
      b.units += it.qty; b.revenueCents += it.priceCents * it.qty;
      prodMap.set(it.name, b);
    }
  }
  const topProducts = [...prodMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);

  return { days, since, revenueCents, orderCount, unitsSold, avgTicketCents, byDay, byChannel, byStatus, topProducts };
}
