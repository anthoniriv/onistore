import { prisma } from "@/lib/prisma";
import { OrdersManager } from "@/components/admin/orders-manager";

export const dynamic = "force-dynamic";

export default async function AdminPedidos() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <div>
      <h1 className="font-display text-3xl">Pedidos <span className="text-base text-oni-ash">({orders.length})</span></h1>
      <OrdersManager orders={orders} />
    </div>
  );
}
